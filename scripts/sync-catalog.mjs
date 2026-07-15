import { lstat, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = path.join(root, "skills");
const realSkillsRoot = await realpath(skillsRoot);
const NAME_PATTERN = /^[a-z][a-z0-9-]{0,62}[a-z0-9]$/;

function frontmatter(content, folder) {
  const match = content.match(/^---\r?\nname:\s*([^\r\n]+)\r?\ndescription:\s*([^\r\n]+)\r?\n---/);
  if (!match) throw new Error(`skills/${folder}/SKILL.md must begin with name and description frontmatter`);
  return {
    name: match[1].trim(),
    description: match[2].trim().replace(/^(?:\"(.*)\"|'(.*)')$/, "$1$2"),
  };
}

const registry = JSON.parse(await readFile(path.join(root, "registry", "skills.json"), "utf8"));
if (registry.schemaVersion !== 2 || !Array.isArray(registry.skills)) throw new Error("registry/skills.json must use schemaVersion 2");

const provenance = JSON.parse(await readFile(path.join(root, "provenance.json"), "utf8"));
const originBySkill = new Map();
for (const [origin, source] of Object.entries(provenance.sources ?? {})) {
  for (const skill of source.skills ?? []) {
    if (originBySkill.has(skill)) throw new Error(`${skill} has multiple provenance owners`);
    originBySkill.set(skill, origin);
  }
}
const officialReferencesBySkill = new Map();
for (const claim of provenance.referenceClaims ?? []) {
  const reference = provenance.referenceSources?.[claim.sourceId];
  if (!reference) throw new Error(`Unknown provenance reference source ${claim.sourceId}`);
  for (const skill of claim.skills ?? []) {
    const references = officialReferencesBySkill.get(skill) ?? [];
    references.push({
      sourceId: claim.sourceId,
      organization: reference.organization,
      repository: reference.repository,
      commit: reference.commit,
      relationship: claim.relationship,
    });
    officialReferencesBySkill.set(skill, references);
  }
}

const catalog = [];
for (const entry of [...registry.skills].sort((left, right) => left.name.localeCompare(right.name))) {
  if (!NAME_PATTERN.test(entry.name)) throw new Error(`registry/skills.json contains unsafe skill name ${entry.name}`);
  const skillDir = path.resolve(skillsRoot, entry.name);
  if (!skillDir.startsWith(`${skillsRoot}${path.sep}`)) throw new Error(`skills/${entry.name} escapes the skills directory`);
  const skillDirStat = await lstat(skillDir);
  if (!skillDirStat.isDirectory() || skillDirStat.isSymbolicLink()) throw new Error(`skills/${entry.name} must be a regular directory, not a symlink`);
  const realSkillDir = await realpath(skillDir);
  if (!realSkillDir.startsWith(`${realSkillsRoot}${path.sep}`)) throw new Error(`skills/${entry.name} resolves outside the skills directory`);
  const skillPath = path.join(skillDir, "SKILL.md");
  const metadata = frontmatter(await readFile(skillPath, "utf8"), entry.name);
  if (metadata.name !== entry.name) throw new Error(`skills/${entry.name}/SKILL.md name does not match registry`);

  const origin = originBySkill.get(entry.name);
  if (!origin) throw new Error(`skills/${entry.name} is not explicitly registered in provenance.json`);
  const source = provenance.sources[origin];
  const activateOn = entry.routing.intents.join(", ");
  const note = {
    name: entry.name,
    version: entry.version,
    description: metadata.description,
    author: source.author,
    category: entry.legacyCategory,
    tags: entry.tags,
    sourceUrls: entry.sourceUrls,
    lastResearchedAt: entry.lastResearchedAt,
    freshnessDays: entry.freshnessDays,
    skills: [{
      file: "SKILL.md",
      name: entry.displayName,
      activateOn,
      freedomLevel: entry.freedomLevel,
    }],
    dependencies: entry.dependencies,
    engines: entry.engines,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
  await writeFile(path.join(skillDir, "note.json"), `${JSON.stringify(note, null, 2)}\n`, "utf8");

  catalog.push({
    name: entry.name,
    displayName: entry.displayName,
    description: metadata.description,
    type: entry.type,
    lifecycle: entry.lifecycle,
    domains: entry.domains,
    actions: entry.actions,
    surfaces: entry.surfaces,
    maturity: entry.maturity,
    freedomLevel: entry.freedomLevel,
    visibility: entry.visibility,
    status: entry.status,
    routing: entry.routing,
    runtime: entry.runtime,
    dependencies: entry.dependencies,
    related: entry.related,
    ...(entry.replacement ? { replacement: entry.replacement } : {}),
    ...(entry.supersedes?.length ? { supersedes: entry.supersedes } : {}),
    collectionIds: entry.collectionIds,
    version: entry.version,
    category: entry.legacyCategory,
    tags: entry.tags,
    origin,
    author: source.author,
    license: source.license,
    source: source.repository,
    sourceRevision: source.commit ?? source.revision,
    upstreamCommit: source.commit ?? null,
    relationship: source.relationship,
    ...(officialReferencesBySkill.has(entry.name) ? { officialReferences: officialReferencesBySkill.get(entry.name) } : {}),
    path: `skills/${entry.name}`,
  });
}

const generatedAt = registry.skills
  .map((entry) => entry.updatedAt)
  .filter(Boolean)
  .sort()
  .at(-1);

await writeFile(
  path.join(root, "catalog.json"),
  `${JSON.stringify({ schemaVersion: 2, generatedAt, skills: catalog }, null, 2)}\n`,
  "utf8",
);

const collectionsRoot = path.join(root, "registry", "collections");
const collections = [];
for (const file of (await readdir(collectionsRoot)).filter((name) => name.endsWith(".json")).sort()) {
  collections.push(JSON.parse(await readFile(path.join(collectionsRoot, file), "utf8")));
}
collections.sort((left, right) => Number(right.defaultInstall) - Number(left.defaultInstall) || left.title.localeCompare(right.title));
const collectionRows = collections.map((collection) => {
  const mode = collection.defaultInstall ? "Recommended core" : collection.visibility === "internal" ? "Internal/optional" : "Optional";
  return `| \`${collection.id}\` | ${collection.include.length} | ${mode} | ${collection.description} |`;
});
const collectionBlock = [
  "<!-- GENERATED:COLLECTIONS:START -->",
  "| Collection | Skills | Availability | Purpose |",
  "| --- | ---: | --- | --- |",
  ...collectionRows,
  "<!-- GENERATED:COLLECTIONS:END -->",
].join("\n");
const readmePath = path.join(root, "README.md");
const readme = await readFile(readmePath, "utf8");
const collectionPattern = /<!-- GENERATED:COLLECTIONS:START -->[\s\S]*?<!-- GENERATED:COLLECTIONS:END -->/;
if (!collectionPattern.test(readme)) throw new Error("README.md is missing generated collection markers");
await writeFile(readmePath, readme.replace(collectionPattern, collectionBlock), "utf8");

console.log(`Synchronized ${catalog.length} skill manifests, ${collections.length} collections, and catalog schema v2.`);
