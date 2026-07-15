import { access, lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const NAME_PATTERN = /^[a-z][a-z0-9-]{0,62}[a-z0-9]$/;
const LOCAL_LINK_PATTERN = /\[[^\]]*\]\(([^)]+)\)/g;
const NOTE_CATEGORIES = new Set(["craft", "research", "connect", "generate"]);
const SKILL_TYPES = new Set(["workflow", "router", "reference", "adapter", "internal-runbook"]);
const LIFECYCLE_STAGES = new Set(["discover", "define", "design", "prototype", "validate", "deliver", "measure", "operate"]);
const DOMAINS = new Set(["product", "research", "interaction", "content", "visual", "systems", "motion", "accessibility", "implementation", "agent-ops"]);
const ACTIONS = new Set(["create", "analyze", "audit", "review", "generate", "integrate", "operate", "reference"]);
const SURFACES = new Set(["figma", "web", "ios", "android", "code", "video", "agent-runtime"]);
const MATURITY = new Set(["experimental", "beta", "stable", "deprecated"]);
const VISIBILITY = new Set(["public", "internal"]);
const STATUS = new Set(["canonical", "alias", "deprecated", "quarantined"]);
const ROUTING_ROLES = new Set(["primary", "supporting", "reference"]);
const PORTABILITY = new Set(["portable", "capability-gated", "adapter-specific", "memoire-only"]);
const FREEDOM_LEVELS = new Set(["low", "medium", "high"]);
const CAPABILITIES = new Set([
  "browser.control",
  "docker.runtime",
  "figma.code-connect",
  "figma.read",
  "figma.write",
  "hyperframes.render",
  "linear.api",
  "memoire.engine",
  "memoire.mcp",
  "notion.api",
  "remotion.render",
]);
const WRITE_CAPABILITIES = new Set(["docker.runtime", "figma.write", "hyperframes.render", "linear.api", "memoire.mcp", "notion.api", "remotion.render"]);

function parseFrontmatter(content) {
  const lines = content.split(/\r?\n/);
  if (lines[0] !== "---") return { data: null, end: -1 };
  const end = lines.indexOf("---", 1);
  if (end === -1) return { data: null, end: -1 };

  const data = {};
  for (const line of lines.slice(1, end)) {
    if (!line.trim()) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const raw = line.slice(separator + 1).trim();
    data[key] = raw.replace(/^(?:"(.*)"|'(.*)')$/, "$1$2");
  }
  return { data, end };
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function validateEnumArray(issues, prefix, value, allowed, label) {
  if (!Array.isArray(value) || value.length === 0) {
    issues.push(`${prefix}: ${label} must be a non-empty array`);
    return;
  }
  for (const item of value) {
    if (!allowed.has(item)) issues.push(`${prefix}: unknown ${label.replace(/s$/, "")} ${item}`);
  }
}

async function validateRegistry(root, folders) {
  const issues = [];
  const registryPath = path.join(root, "registry", "skills.json");
  if (!(await exists(registryPath))) return ["registry/skills.json: canonical metadata registry is required"];

  let registry;
  try {
    registry = JSON.parse(await readFile(registryPath, "utf8"));
  } catch {
    return ["registry/skills.json: must contain valid JSON"];
  }
  if (registry.schemaVersion !== 2) issues.push("registry/skills.json: schemaVersion must be 2");
  const entries = Array.isArray(registry.skills) ? registry.skills : [];
  const names = entries.map((entry) => entry.name);
  for (const folder of folders) if (!names.includes(folder)) issues.push(`skills/${folder}: missing from registry/skills.json`);
  for (const name of names) if (!folders.includes(name)) issues.push(`registry/skills.json: ${name} has no matching skill folder`);
  if (new Set(names).size !== names.length) issues.push("registry/skills.json: skill names must be unique");

  const primaryIntentOwners = new Map();
  for (const entry of entries) {
    const prefix = `registry/skills.json: ${entry.name ?? "unnamed skill"}`;
    if (!SKILL_TYPES.has(entry.type)) issues.push(`${prefix}: unknown type ${entry.type}`);
    validateEnumArray(issues, prefix, entry.lifecycle, LIFECYCLE_STAGES, "lifecycle stages");
    validateEnumArray(issues, prefix, entry.domains, DOMAINS, "domains");
    validateEnumArray(issues, prefix, entry.actions, ACTIONS, "actions");
    validateEnumArray(issues, prefix, entry.surfaces, SURFACES, "surfaces");
    if (!MATURITY.has(entry.maturity)) issues.push(`${prefix}: unknown maturity ${entry.maturity}`);
    if (!FREEDOM_LEVELS.has(entry.freedomLevel)) issues.push(`${prefix}: freedomLevel must be explicitly low, medium, or high`);
    if (!VISIBILITY.has(entry.visibility)) issues.push(`${prefix}: unknown visibility ${entry.visibility}`);
    if (!STATUS.has(entry.status)) issues.push(`${prefix}: unknown status ${entry.status}`);
    if (!ROUTING_ROLES.has(entry.routing?.role)) issues.push(`${prefix}: unknown routing role ${entry.routing?.role}`);
    const intents = entry.routing?.intents;
    if (!Array.isArray(intents) || intents.length === 0) issues.push(`${prefix}: routing intents must be a non-empty array`);
    else {
      for (const intent of intents) {
        if (intent === "always") issues.push(`${prefix}: routing intent always is forbidden`);
        if (!NAME_PATTERN.test(intent)) issues.push(`${prefix}: routing intent ${intent} must be a controlled kebab-case id`);
        if (entry.routing.role === "primary") {
          const owner = primaryIntentOwners.get(intent);
          if (owner && owner !== entry.name) issues.push(`${prefix}: primary routing intent ${intent} is already owned by ${owner}`);
          else primaryIntentOwners.set(intent, entry.name);
        }
      }
    }
    if (!PORTABILITY.has(entry.runtime?.portability)) issues.push(`${prefix}: unknown portability ${entry.runtime?.portability}`);
    const requiredCapabilities = entry.runtime?.requires;
    if (!Array.isArray(requiredCapabilities)) issues.push(`${prefix}: runtime.requires must be an array`);
    else {
      for (const capability of requiredCapabilities) if (!CAPABILITIES.has(capability)) issues.push(`${prefix}: unknown capability ${capability}`);
      if (entry.runtime.portability !== "portable" && requiredCapabilities.length === 0) issues.push(`${prefix}: ${entry.runtime.portability} runtime.requires must declare at least one capability`);
      if (entry.runtime.portability === "portable" && requiredCapabilities.length > 0) issues.push(`${prefix}: portable skills cannot require capabilities`);
      const requiredWrites = requiredCapabilities.filter((capability) => WRITE_CAPABILITIES.has(capability));
      if (entry.freedomLevel === "high" && requiredWrites.length > 0) issues.push(`${prefix}: high freedomLevel is forbidden for write-capable skills`);
      if (requiredWrites.length > 0 && !entry.runtime.approval) issues.push(`${prefix}: write-capable skills require an explicit runtime.approval contract`);
    }
    if (!Array.isArray(entry.dependencies)) issues.push(`${prefix}: dependencies must be an array`);
    else for (const dependency of entry.dependencies) {
      const target = entries.find((candidate) => candidate.name === dependency);
      if (!target) issues.push(`${prefix}: unknown dependency ${dependency}`);
      else if (entry.status === "canonical" && ["deprecated", "quarantined"].includes(target.status)) issues.push(`${prefix}: canonical skill cannot depend on ${target.status} skill ${dependency}`);
    }
    if (!Array.isArray(entry.collectionIds)) issues.push(`${prefix}: collectionIds must be an array`);
    if (entry.visibility === "public" && entry.status === "canonical" && entry.collectionIds?.length === 0) issues.push(`${prefix}: public canonical skills require a collection`);
    if (entry.status === "quarantined") {
      issues.push(`${prefix}: quarantined payloads cannot remain under the publicly discoverable skills directory`);
      if (entry.routing?.role === "primary") issues.push(`${prefix}: quarantined skills cannot own a primary routing intent`);
    }
    if (entry.status === "deprecated") {
      const replacement = entries.find((candidate) => candidate.name === entry.replacement);
      if (!entry.replacement || !replacement) issues.push(`${prefix}: replacement ${entry.replacement ?? "is required"} must resolve to a canonical skill`);
      else {
        if (replacement.status !== "canonical") issues.push(`${prefix}: replacement ${entry.replacement} must be canonical`);
        if (!replacement.supersedes?.includes(entry.name)) issues.push(`${prefix}: replacement ${entry.replacement} must declare supersedes ${entry.name}`);
      }
      if (entry.routing?.role === "primary") issues.push(`${prefix}: deprecated skills cannot own a primary routing intent`);
      if (entry.collectionIds?.length > 0) issues.push(`${prefix}: deprecated skills cannot belong to collections`);
    }
    for (const superseded of entry.supersedes ?? []) {
      const oldEntry = entries.find((candidate) => candidate.name === superseded);
      if (!oldEntry || oldEntry.status !== "deprecated" || oldEntry.replacement !== entry.name) issues.push(`${prefix}: supersedes ${superseded} must reciprocally reference this canonical replacement`);
    }
    if (!NOTE_CATEGORIES.has(entry.legacyCategory)) issues.push(`${prefix}: unknown legacyCategory ${entry.legacyCategory}`);
  }

  const collectionsRoot = path.join(root, "registry", "collections");
  if (!(await exists(collectionsRoot))) return [...issues, "registry/collections: collection registry is required"];
  const collectionFiles = (await readdir(collectionsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();
  const collections = new Map();
  for (const file of collectionFiles) {
    let collection;
    try {
      collection = JSON.parse(await readFile(path.join(collectionsRoot, file), "utf8"));
    } catch {
      issues.push(`registry/collections/${file}: must contain valid JSON`);
      continue;
    }
    const expectedId = file.slice(0, -5);
    if (collection.id !== expectedId) issues.push(`registry/collections/${file}: id must match filename`);
    if (collections.has(collection.id)) issues.push(`registry/collections/${file}: duplicate collection id ${collection.id}`);
    collections.set(collection.id, collection);
    if (!Array.isArray(collection.include)) issues.push(`registry/collections/${file}: include must be an array`);
    for (const name of collection.include ?? []) {
      const skill = entries.find((entry) => entry.name === name);
      if (!skill) {
        issues.push(`registry/collections/${file}: unknown skill ${name}`);
        continue;
      }
      if (!skill.collectionIds?.includes(collection.id)) issues.push(`registry/collections/${file}: ${name} does not declare collection ${collection.id}`);
      if (collection.visibility === "public" && ["quarantined", "deprecated"].includes(skill.status)) issues.push(`registry/collections/${file}: ${skill.status} skill ${name} cannot appear in ${collection.id}`);
      if (collection.visibility === "public" && skill.visibility === "internal") issues.push(`registry/collections/${file}: internal skill ${name} cannot appear in ${collection.id}`);
      if (collection.defaultInstall && (skill.maturity !== "stable" || skill.runtime?.portability !== "portable" || skill.status !== "canonical" || skill.visibility !== "public")) {
        issues.push(`registry/collections/${file}: default collection ${collection.id} requires public stable canonical portable skills; found ${name}`);
      }
      if (collection.dependencyPolicy === "include-required") {
        for (const dependency of skill.dependencies ?? []) if (!collection.include.includes(dependency)) issues.push(`registry/collections/${file}: ${name} requires missing dependency ${dependency}`);
      }
    }
  }
  for (const entry of entries) {
    for (const collectionId of entry.collectionIds ?? []) {
      const collection = collections.get(collectionId);
      if (!collection) issues.push(`registry/skills.json: ${entry.name} references unknown collection ${collectionId}`);
      else if (!collection.include?.includes(entry.name)) issues.push(`registry/skills.json: ${entry.name} is missing from collection ${collectionId}`);
    }
  }
  return issues;
}

async function validateSkill(root, folder) {
  const issues = [];
  const prefix = `skills/${folder}`;
  const skillDir = path.join(root, "skills", folder);
  const skillPath = path.join(skillDir, "SKILL.md");

  async function inspectTree(currentDir, relativeDir = "") {
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      const fullPath = path.join(currentDir, entry.name);
      const fileStat = await lstat(fullPath);
      if (fileStat.isSymbolicLink()) {
        issues.push(`${prefix}/${relativePath}: symbolic links are not allowed`);
      } else if (fileStat.isDirectory()) {
        await inspectTree(fullPath, relativePath);
      } else if (!fileStat.isFile()) {
        issues.push(`${prefix}/${relativePath}: only regular files and directories are allowed`);
      } else if ((fileStat.mode & 0o111) !== 0) {
        issues.push(`${prefix}/${relativePath}: executable files are not allowed in skill payloads`);
      } else if (entry.name.endsWith(".md")) {
        const markdown = await readFile(fullPath, "utf8");
        for (const match of markdown.matchAll(LOCAL_LINK_PATTERN)) {
          const target = match[1].split("#")[0].trim();
          if (!target || target === "url" || target.includes("${") || /^(?:https?:|mailto:|notion:|#)/.test(target)) continue;
          if (/^[a-z][a-z+.-]*:/i.test(target)) {
            issues.push(`${prefix}/${relativePath}: unsafe link scheme ${target}`);
            continue;
          }
          const resolved = path.resolve(path.dirname(fullPath), decodeURIComponent(target));
          const skillsRoot = path.join(root, "skills");
          if (!resolved.startsWith(`${skillsRoot}${path.sep}`) || !(await exists(resolved))) {
            issues.push(`${prefix}/${relativePath}: missing local reference ${target}`);
          }
        }
      }
    }
  }

  await inspectTree(skillDir);

  if (!NAME_PATTERN.test(folder)) issues.push(`${prefix}: folder name must be kebab-case and under 64 characters`);
  if (!(await exists(skillPath))) return [...issues, `${prefix}: SKILL.md is required`];

  const content = await readFile(skillPath, "utf8");
  const lines = content.split(/\r?\n/);
  const { data, end } = parseFrontmatter(content);
  if (!data) {
    issues.push(`${prefix}/SKILL.md: valid YAML frontmatter is required`);
  } else {
    for (const key of Object.keys(data)) {
      if (!["name", "description"].includes(key)) issues.push(`${prefix}/SKILL.md: unsupported frontmatter key: ${key}`);
    }
    if (data.name !== folder) issues.push(`${prefix}/SKILL.md: frontmatter name must match folder`);
    if (!data.description || data.description.length < 40) issues.push(`${prefix}/SKILL.md: description must explain purpose and triggering context`);
    const descriptionLine = lines.slice(1, end).find((line) => line.startsWith("description:"));
    const rawDescription = descriptionLine?.slice(descriptionLine.indexOf(":") + 1).trim() ?? "";
    if (!/^(?:\".*\"|'.*')$/.test(rawDescription) && /:\s/.test(rawDescription)) issues.push(`${prefix}/SKILL.md: quote description values containing YAML-significant colons`);
    if (end === lines.length - 1) issues.push(`${prefix}/SKILL.md: skill body is required`);
  }
  if (lines.length > 500) issues.push(`${prefix}/SKILL.md: exceeds the 500-line progressive-disclosure limit (${lines.length})`);

  const notePath = path.join(skillDir, "note.json");
  if (!(await exists(notePath))) {
    issues.push(`${prefix}/note.json: note.json is required`);
  } else {
    let note;
    try {
      note = JSON.parse(await readFile(notePath, "utf8"));
    } catch {
      issues.push(`${prefix}/note.json: must contain valid JSON`);
      return issues;
    }
    if (note.name !== folder) issues.push(`${prefix}/note.json: note.json name must match folder`);
    if (!/^\d+\.\d+\.\d+$/.test(note.version ?? "")) issues.push(`${prefix}/note.json: version must be semver`);
    if (note.description !== data?.description) issues.push(`${prefix}/note.json: description must match SKILL.md frontmatter`);
    if (!note.author) issues.push(`${prefix}/note.json: author is required`);
    if (!NOTE_CATEGORIES.has(note.category)) issues.push(`${prefix}/note.json: category must be craft, research, connect, or generate`);
    if (!Array.isArray(note.sourceUrls) || note.sourceUrls.length === 0) issues.push(`${prefix}/note.json: sourceUrls are required`);
    else if (note.sourceUrls.some((url) => {
      try { return new URL(url).protocol !== "https:"; } catch { return true; }
    })) issues.push(`${prefix}/note.json: sourceUrls must use HTTPS`);
    if (!note.lastResearchedAt || !Number.isInteger(note.freshnessDays)) issues.push(`${prefix}/note.json: freshness metadata is required`);
    if (!Array.isArray(note.skills) || !note.skills.some((entry) => entry.file === "SKILL.md")) {
      issues.push(`${prefix}/note.json: note.json skills must reference SKILL.md`);
    }
  }

  return issues;
}

export async function validateRepository(root) {
  const issues = [];
  const skillsRoot = path.join(root, "skills");
  if (!(await exists(skillsRoot))) return ["skills/: directory is required"];

  const folders = (await readdir(skillsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  for (const folder of folders) issues.push(...await validateSkill(root, folder));
  issues.push(...await validateRegistry(root, folders));

  const catalogPath = path.join(root, "catalog.json");
  if (!(await exists(catalogPath))) return [...issues, "catalog.json: file is required"];

  let catalog;
  try {
    catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  } catch {
    return [...issues, "catalog.json: must contain valid JSON"];
  }
  const entries = Array.isArray(catalog.skills) ? catalog.skills : [];
  if (catalog.schemaVersion !== 2) issues.push("catalog.json: schemaVersion must be 2");
  const names = entries.map((entry) => entry.name);
  for (const folder of folders) {
    if (!names.includes(folder)) issues.push(`skills/${folder}: missing from catalog.json`);
  }
  for (const name of names) {
    if (!folders.includes(name)) issues.push(`catalog.json: ${name} has no matching skill folder`);
  }
  if (new Set(names).size !== names.length) issues.push("catalog.json: skill names must be unique");
  for (const entry of entries) {
    if (!entry.category || !entry.origin) issues.push(`catalog.json: ${entry.name ?? "unnamed skill"} requires category and origin`);
  }

  try {
    const registry = JSON.parse(await readFile(path.join(root, "registry", "skills.json"), "utf8"));
    const catalogByName = new Map(entries.map((entry) => [entry.name, entry]));
    const projectedFields = ["type", "lifecycle", "domains", "actions", "surfaces", "maturity", "freedomLevel", "visibility", "status", "routing", "runtime", "dependencies", "related", "replacement", "supersedes", "collectionIds", "version"];
    for (const registryEntry of registry.skills ?? []) {
      const catalogEntry = catalogByName.get(registryEntry.name);
      if (!catalogEntry) continue;
      for (const field of projectedFields) {
        if (JSON.stringify(catalogEntry[field]) !== JSON.stringify(registryEntry[field])) issues.push(`catalog.json: ${registryEntry.name} ${field} does not match registry/skills.json`);
      }
      if (catalogEntry.category !== registryEntry.legacyCategory) issues.push(`catalog.json: ${registryEntry.name} category does not match registry/skills.json`);
      try {
        const note = JSON.parse(await readFile(path.join(skillsRoot, registryEntry.name, "note.json"), "utf8"));
        const expectedActivation = registryEntry.routing.intents.join(", ");
        if (note.skills?.[0]?.activateOn !== expectedActivation) issues.push(`skills/${registryEntry.name}/note.json: activateOn does not match registry routing intents`);
        if (note.skills?.[0]?.freedomLevel !== registryEntry.freedomLevel) issues.push(`skills/${registryEntry.name}/note.json: freedomLevel does not match registry/skills.json`);
        if (JSON.stringify(note.dependencies ?? []) !== JSON.stringify(registryEntry.dependencies ?? [])) issues.push(`skills/${registryEntry.name}/note.json: dependencies do not match registry/skills.json`);
      } catch {}
    }
  } catch {}

  const dependencyGraph = new Map();
  for (const folder of folders) {
    const notePath = path.join(skillsRoot, folder, "note.json");
    if (!(await exists(notePath))) continue;
    try {
      const note = JSON.parse(await readFile(notePath, "utf8"));
      const dependencies = Array.isArray(note.dependencies) ? note.dependencies : [];
      dependencyGraph.set(folder, dependencies);
      for (const dependency of dependencies) {
        if (!folders.includes(dependency)) issues.push(`skills/${folder}/note.json: unknown dependency ${dependency}`);
      }
    } catch {}
  }
  const visiting = new Set();
  const visited = new Set();
  function visit(name, pathNames = []) {
    if (visiting.has(name)) {
      issues.push(`skills/${name}/note.json: dependency cycle ${[...pathNames, name].join(" -> ")}`);
      return;
    }
    if (visited.has(name)) return;
    visiting.add(name);
    for (const dependency of dependencyGraph.get(name) ?? []) visit(dependency, [...pathNames, name]);
    visiting.delete(name);
    visited.add(name);
  }
  for (const folder of folders) visit(folder);

  const provenancePath = path.join(root, "provenance.json");
  if (!(await exists(provenancePath))) return [...issues, "provenance.json: file is required"].sort();
  let provenance;
  try {
    provenance = JSON.parse(await readFile(provenancePath, "utf8"));
  } catch {
    return [...issues, "provenance.json: must contain valid JSON"].sort();
  }
  const sources = provenance.sources && typeof provenance.sources === "object" ? provenance.sources : {};
  let registryEntries = [];
  try {
    const registry = JSON.parse(await readFile(path.join(root, "registry", "skills.json"), "utf8"));
    registryEntries = Array.isArray(registry.skills) ? registry.skills : [];
  } catch {}
  const registryByName = new Map(registryEntries.map((entry) => [entry.name, entry]));
  const referenceSources = provenance.referenceSources && typeof provenance.referenceSources === "object" ? provenance.referenceSources : {};
  const expectedReferencesBySkill = new Map();
  for (const [sourceId, reference] of Object.entries(referenceSources)) {
    if (!reference.organization || !/^https:\/\//.test(reference.repository ?? "") || !/^[a-f0-9]{40}$/i.test(reference.commit ?? "") || !reference.relationship) {
      issues.push(`provenance.json: reference source ${sourceId} requires organization, HTTPS repository, immutable commit, and relationship`);
    }
  }
  for (const claim of provenance.referenceClaims ?? []) {
    const reference = referenceSources[claim.sourceId];
    if (!reference) {
      issues.push(`provenance.json: reference claim uses unknown source ${claim.sourceId}`);
      continue;
    }
    if (claim.relationship !== "link-only-router") issues.push(`provenance.json: unsupported reference relationship ${claim.relationship}`);
    for (const skill of claim.skills ?? []) {
      if (!folders.includes(skill)) issues.push(`provenance.json: reference claim ${claim.sourceId} uses unknown skill ${skill}`);
      const references = expectedReferencesBySkill.get(skill) ?? [];
      references.push({ sourceId: claim.sourceId, organization: reference.organization, repository: reference.repository, commit: reference.commit, relationship: claim.relationship });
      expectedReferencesBySkill.set(skill, references);
    }
  }
  const provenanceClaims = new Map();
  for (const [origin, source] of Object.entries(sources)) {
    if (!source.author || !source.repository || !source.license || !source.relationship) {
      issues.push(`provenance.json: ${origin} requires author, repository, license, and relationship`);
    }
    if (!/^https:\/\//.test(source.repository ?? "")) issues.push(`provenance.json: ${origin} repository must use HTTPS`);
    const repositoryLocal = source.relationship === "first-party-in-repository";
    if (repositoryLocal) {
      if (source.revision !== "repository-local" || source.commit) issues.push(`provenance.json: ${origin} must use repository-local revision semantics without a self-referential commit`);
    } else if (!/^[a-f0-9]{40}$/i.test(source.commit ?? "")) issues.push(`provenance.json: ${origin} requires an immutable 40-character commit`);
    const licensePath = source.licenseFile ? path.resolve(root, source.licenseFile) : null;
    const licenseRelative = licensePath ? path.relative(root, licensePath) : "..";
    if (!source.licenseFile || path.isAbsolute(source.licenseFile) || licenseRelative.startsWith("..") || path.isAbsolute(licenseRelative) || !(await exists(licensePath))) {
      issues.push(`provenance.json: ${origin} licenseFile must be a repository-contained relative file`);
    } else {
      const licenseStat = await lstat(licensePath);
      if (!licenseStat.isFile() || licenseStat.isSymbolicLink()) issues.push(`provenance.json: ${origin} licenseFile must be a regular non-symlink file`);
    }
    for (const skill of source.skills ?? []) {
      if (provenanceClaims.has(skill)) issues.push(`provenance.json: ${skill} is claimed by both ${provenanceClaims.get(skill)} and ${origin}`);
      provenanceClaims.set(skill, origin);
      const entry = entries.find((candidate) => candidate.name === skill);
      if (!entry) issues.push(`provenance.json: ${origin} references unknown skill ${skill}`);
      else if (entry.origin !== origin) issues.push(`provenance.json: ${skill} origin does not match ${origin}`);
      if (source.permissions?.redistribution === "unknown" && registryByName.get(skill)?.status !== "quarantined") {
        issues.push(`provenance.json: ${skill} has unknown redistribution rights and must remain quarantined`);
      }
    }
  }
  for (const entry of entries) {
    const source = sources[entry.origin];
    if (!source) {
      issues.push(`catalog.json: ${entry.name} has unknown provenance origin ${entry.origin}`);
      continue;
    }
    if (provenanceClaims.get(entry.name) !== entry.origin) {
      issues.push(`provenance.json: ${entry.name} must be explicitly claimed by ${entry.origin}`);
    }
    const sourceRevision = source.commit ?? source.revision;
    if (entry.license !== source.license || entry.source !== source.repository || entry.sourceRevision !== sourceRevision || entry.upstreamCommit !== (source.commit ?? null)) {
      issues.push(`catalog.json: ${entry.name} provenance fields do not match ${entry.origin}`);
    }
    if (JSON.stringify(entry.officialReferences ?? []) !== JSON.stringify(expectedReferencesBySkill.get(entry.name) ?? [])) issues.push(`catalog.json: ${entry.name} official references do not match provenance.json`);
  }

  return issues.sort();
}

async function main() {
  const root = path.resolve(process.argv[2] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
  const issues = await validateRepository(root);
  if (issues.length > 0) {
    console.error(`Validation failed with ${issues.length} issue${issues.length === 1 ? "" : "s"}:`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
    return;
  }
  const catalog = JSON.parse(await readFile(path.join(root, "catalog.json"), "utf8"));
  console.log(`Validated ${catalog.skills.length} design skills.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
