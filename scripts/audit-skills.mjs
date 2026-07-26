import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIMENSION_MAXIMUMS = {
  triggerPrecision: 20,
  actionability: 20,
  freshness: 15,
  sourceQuality: 15,
  progressiveDisclosure: 10,
  installation: 10,
  uniqueness: 10,
};

const GENERIC_TAGS = new Set(["craft", "design-skills", "research", "generate", "connect"]);

function frontmatter(content) {
  const match = content.match(/^---\r?\nname:\s*([^\r\n]+)\r?\ndescription:\s*([^\r\n]+)\r?\n---/);
  if (!match) return { name: "", description: "", body: content };
  return {
    name: match[1].trim(),
    description: match[2].trim().replace(/^(?:\"(.*)\"|'(.*)')$/, "$1$2"),
    body: content.slice(match[0].length),
  };
}

function validHttps(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function daysBetween(then, now) {
  const timestamp = Date.parse(then);
  if (!Number.isFinite(timestamp)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor((now.getTime() - timestamp) / 86_400_000));
}

function referencesIn(content) {
  return [...content.matchAll(/\[[^\]]+\]\(([^)]+\.md(?:#[^)]+)?)\)/g)]
    .map((match) => match[1].split("#")[0])
    .filter((target) => !/^[a-z][a-z+.-]*:/i.test(target));
}

function verdictFor(entry, dimensions) {
  const score = Object.values(dimensions).reduce((total, value) => total + value, 0);
  if (entry.status === "deprecated") return "Retire";
  if (dimensions.sourceQuality < 10) return "Retire";
  if (dimensions.freshness <= 6) return "Update";
  if (score >= 90 && dimensions.triggerPrecision >= 15 && dimensions.actionability >= 15 && dimensions.uniqueness >= 8) return "Keep";
  return "Improve";
}

function reasonFor(entry, dimensions, age, verdict) {
  if (entry.status === "deprecated") {
    return `Deprecated compatibility surface; ${entry.replacement} already owns the canonical workflow. Retire this alias after its documented compatibility window and preserve the replacement path.`;
  }

  const gaps = [];
  if (dimensions.triggerPrecision < 15) gaps.push("tighten the trigger description and routing exclusions");
  if (dimensions.actionability < 15) gaps.push("add a bounded workflow, verification step, and explicit output contract");
  if (dimensions.freshness < 15) gaps.push(`refresh sources last reviewed ${Number.isFinite(age) ? `${age} days` : "at an invalid date"} ago`);
  if (dimensions.sourceQuality < 15) gaps.push("repair HTTPS source or immutable provenance evidence");
  if (dimensions.progressiveDisclosure < 8) gaps.push("move detail into directly linked one-level references");
  if (dimensions.installation < 10) gaps.push("repair manifest or collection installation metadata");
  if (dimensions.uniqueness < 8) gaps.push("replace generic tags and declare neighboring workflow boundaries");

  if (gaps.length === 0) {
    return "Bounded trigger, actionable workflow, current sources, immutable provenance, progressive references, and install metadata all validate; retain as a distinct canonical skill.";
  }
  const disposition = verdict === "Keep"
    ? "Retain as canonical and address these minor follow-ups during routine maintenance."
    : "Keep the skill and address these concrete gaps before promoting it as a default route.";
  return `Useful bounded capability, but ${gaps.slice(0, 3).join("; ")}. ${disposition}`;
}

function markdownFor(audit) {
  const rows = audit.skills.map((skill) => [
    skill.name,
    skill.score,
    skill.verdict,
    skill.dimensions.triggerPrecision,
    skill.dimensions.actionability,
    skill.dimensions.freshness,
    skill.dimensions.sourceQuality,
    skill.dimensions.progressiveDisclosure,
    skill.dimensions.installation,
    skill.dimensions.uniqueness,
    skill.reason.replaceAll("|", "\\|"),
  ]);
  const verdictCounts = Object.entries(audit.summary.verdictCounts)
    .map(([verdict, count]) => `${verdict}: ${count}`)
    .join(", ");
  return [
    "# Canonical Design Skill Stocktake",
    "",
    `Evidence date: ${audit.auditedAt.slice(0, 10)}`,
    "",
    "## Summary",
    "",
    `- Catalog entries: ${audit.summary.totalSkills}`,
    `- Canonical entries: ${audit.summary.canonicalSkills}`,
    `- Deprecated compatibility entries: ${audit.summary.deprecatedSkills}`,
    `- Mean score: ${audit.summary.meanScore}/100`,
    `- Dispositions: ${verdictCounts}`,
    `- Duplicate primary routing intents: ${audit.summary.duplicatePrimaryIntents.length}`,
    "",
    "Scores use repository evidence only. Missing evidence receives no credit. A Retire verdict is a recommendation and does not authorize deletion.",
    "",
    "## Rubric",
    "",
    "| Dimension | Maximum | Evidence |",
    "| --- | ---: | --- |",
    "| Trigger precision | 20 | Description, bounded intent owner, exclusions |",
    "| Actionability | 20 | Workflow, verification, output contract, imperative steps |",
    "| Freshness | 15 | `lastResearchedAt` against the declared freshness window |",
    "| Source quality | 15 | Valid HTTPS sources and immutable or repository-local provenance |",
    "| Progressive disclosure | 10 | Entrypoint size and directly linked one-level references |",
    "| Installation | 10 | Generated Note, registry, status, and collection membership |",
    "| Uniqueness | 10 | Unique route, descriptive tags, and declared neighboring boundaries |",
    "",
    "## Results",
    "",
    "| Skill | Score | Disposition | Trigger | Action | Fresh | Source | Disclosure | Install | Unique | Reason |",
    "| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...rows.map((row) => `| ${row.join(" | ")} |`),
    "",
  ].join("\n");
}

export async function auditSkills(root, asOf = new Date()) {
  const registry = JSON.parse(await readFile(path.join(root, "registry", "skills.json"), "utf8"));
  const provenance = JSON.parse(await readFile(path.join(root, "provenance.json"), "utf8"));
  const collections = await Promise.all(
    (await readdir(path.join(root, "registry", "collections")))
      .filter((file) => file.endsWith(".json"))
      .map(async (file) => JSON.parse(await readFile(path.join(root, "registry", "collections", file), "utf8"))),
  );
  const collectionMembers = new Map();
  for (const collection of collections) {
    for (const name of collection.include) {
      const memberships = collectionMembers.get(name) ?? [];
      memberships.push(collection.id);
      collectionMembers.set(name, memberships);
    }
  }
  const provenanceOwners = new Map();
  for (const [sourceId, source] of Object.entries(provenance.sources ?? {})) {
    for (const skill of source.skills ?? []) provenanceOwners.set(skill, { sourceId, source });
  }
  const primaryIntentOwners = new Map();
  for (const entry of registry.skills) {
    if (entry.routing?.role !== "primary") continue;
    for (const intent of entry.routing.intents ?? []) {
      const owners = primaryIntentOwners.get(intent) ?? [];
      owners.push(entry.name);
      primaryIntentOwners.set(intent, owners);
    }
  }

  const skills = [];
  for (const entry of registry.skills) {
    const skillDir = path.join(root, "skills", entry.name);
    const content = await readFile(path.join(skillDir, "SKILL.md"), "utf8");
    const metadata = frontmatter(content);
    const lines = content.split(/\r?\n/).length;
    const localReferences = referencesIn(content);
    const referencesResolve = (await Promise.all(localReferences.map(async (target) => {
      try {
        await access(path.resolve(skillDir, target));
        return true;
      } catch {
        return false;
      }
    }))).every(Boolean);
    const note = JSON.parse(await readFile(path.join(skillDir, "note.json"), "utf8"));
    const provenanceOwner = provenanceOwners.get(entry.name);
    const age = daysBetween(entry.lastResearchedAt, asOf);
    const freshnessWindow = Number.isInteger(entry.freshnessDays) ? entry.freshnessDays : 0;
    const descriptiveTags = (entry.tags ?? []).filter((tag) => !GENERIC_TAGS.has(tag));
    const uniqueIntent = (entry.routing?.intents ?? []).every((intent) => (primaryIntentOwners.get(intent) ?? [entry.name]).length === 1);

    const declaredCollections = [...(entry.collectionIds ?? [])].sort();
    const actualCollections = [...(collectionMembers.get(entry.name) ?? [])].sort();
    const dimensions = {
      triggerPrecision:
        (metadata.description.length >= 40 ? 5 : 0)
        + (metadata.description.length >= 80 && metadata.description.length <= 500 ? 5 : 0)
        + (/(?:use when|when |triggers?|including|for )/i.test(metadata.description) ? 4 : 0)
        + ((entry.routing?.intents ?? []).length === 1 ? 3 : 0)
        + ((entry.routing?.excludes ?? []).length > 0 || entry.routing?.role === "reference" ? 3 : 0),
      actionability:
        (metadata.body.trim().length >= 240 ? 4 : 0)
        + (/^## (?:Workflow|Steps|Checks|Checklist|Process|Quick start)/im.test(metadata.body) ? 5 : 0)
        + (/\b(?:verify|test|evidence|validate|profile|capture)\b/i.test(metadata.body) ? 4 : 0)
        + (/\b(?:output|handoff|report|verdict|deliverable)\b/i.test(metadata.body) ? 4 : 0)
        + (/^(?:\d+\.|- )\s+\S/m.test(metadata.body) ? 3 : 0),
      freshness: age <= freshnessWindow ? 15 : age <= freshnessWindow * 2 ? 8 : Number.isFinite(age) ? 2 : 0,
      sourceQuality:
        (Array.isArray(entry.sourceUrls) && entry.sourceUrls.length > 0 && entry.sourceUrls.every(validHttps) ? 5 : 0)
        + (provenanceOwner ? 5 : 0)
        + (provenanceOwner && (provenanceOwner.source.commit || provenanceOwner.source.revision === "repository-local") ? 5 : 0),
      progressiveDisclosure:
        (lines <= 500 ? 4 : 0)
        + (lines <= 200 || localReferences.length > 0 ? 3 : 0)
        + (referencesResolve ? 3 : 0),
      installation:
        (note.name === entry.name && note.skills?.some((skill) => skill.file === "SKILL.md") ? 4 : 0)
        + (JSON.stringify(actualCollections) === JSON.stringify(declaredCollections) ? 3 : 0)
        + (["canonical", "deprecated"].includes(entry.status) ? 3 : 0),
      uniqueness:
        (uniqueIntent ? 5 : 0)
        + (descriptiveTags.length >= 3 ? 3 : descriptiveTags.length > 0 ? 1 : 0)
        + ((entry.related ?? []).length > 0 || (entry.routing?.excludes ?? []).length > 0 || entry.routing?.role === "reference" ? 2 : 0),
    };
    const score = Object.values(dimensions).reduce((total, value) => total + value, 0);
    const verdict = verdictFor(entry, dimensions);
    skills.push({
      name: entry.name,
      path: `skills/${entry.name}/SKILL.md`,
      status: entry.status,
      score,
      verdict,
      dimensions,
      reason: reasonFor(entry, dimensions, age, verdict),
      evidence: {
        lines,
        localReferences: localReferences.length,
        lastResearchedAt: entry.lastResearchedAt,
        ageDays: Number.isFinite(age) ? age : null,
        freshnessDays: entry.freshnessDays,
        sourceCount: entry.sourceUrls?.length ?? 0,
        collections: entry.collectionIds ?? [],
        routingIntents: entry.routing?.intents ?? [],
        routingExcludes: entry.routing?.excludes ?? [],
      },
    });
  }

  skills.sort((left, right) => left.name.localeCompare(right.name));
  const verdictCounts = {};
  for (const skill of skills) verdictCounts[skill.verdict] = (verdictCounts[skill.verdict] ?? 0) + 1;
  const duplicatePrimaryIntents = [...primaryIntentOwners.entries()]
    .filter(([, owners]) => owners.length > 1)
    .map(([intent, owners]) => ({ intent, owners }))
    .sort((left, right) => left.intent.localeCompare(right.intent));
  return {
    schemaVersion: 1,
    auditedAt: asOf.toISOString(),
    methodology: {
      maximumScore: 100,
      missingEvidenceScoresZero: true,
      dimensions: DIMENSION_MAXIMUMS,
      dispositions: ["Keep", "Improve", "Update", "Merge", "Retire"],
    },
    summary: {
      totalSkills: skills.length,
      canonicalSkills: registry.skills.filter((entry) => entry.status === "canonical").length,
      deprecatedSkills: registry.skills.filter((entry) => entry.status === "deprecated").length,
      meanScore: Math.round(skills.reduce((total, skill) => total + skill.score, 0) / skills.length),
      verdictCounts,
      duplicatePrimaryIntents,
    },
    skills,
  };
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const asOfIndex = process.argv.indexOf("--as-of");
  const asOfValue = asOfIndex === -1 ? new Date() : new Date(`${process.argv[asOfIndex + 1]}T00:00:00.000Z`);
  if (Number.isNaN(asOfValue.getTime())) throw new Error("--as-of must be YYYY-MM-DD");
  const audit = await auditSkills(root, asOfValue);
  const date = audit.auditedAt.slice(0, 10);
  const auditDir = path.join(root, "docs", "audits");
  await mkdir(auditDir, { recursive: true });
  await writeFile(path.join(auditDir, `skill-stocktake-${date}.json`), `${JSON.stringify(audit, null, 2)}\n`);
  await writeFile(path.join(auditDir, `skill-stocktake-${date}.md`), markdownFor(audit));
  console.log(`Audited ${audit.summary.totalSkills} skills at ${audit.summary.meanScore}/100 mean; wrote docs/audits/skill-stocktake-${date}.{json,md}.`);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  await main();
}
