import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function readBytes(relativePath) {
  return readFile(path.join(root, relativePath));
}

const sha256 = (contents) => createHash("sha256").update(contents).digest("hex");

test("vendors the exact revision-3 brand contract and rejects Design Skills identity drift", async () => {
  const [manifestSource, schemaSource, packageSource, readme, localIcon] = await Promise.all([
    readBytes("brand/brand-manifest.v1.json"),
    readBytes("brand/brand-manifest.v1.schema.json"),
    read("package.json"),
    read("README.md"),
    readBytes("assets/memi-avatar.png"),
  ]);

  assert.equal(
    sha256(manifestSource),
    "8b7ca68e836ee0362fe1763b067dacb8e500d5037cd12791f6c5aaf0e80a2755",
  );
  assert.equal(
    sha256(schemaSource),
    "ef3eaed367e20c3d54ef8284d84c8195d40fb5916fcd525fcd77243a0353e473",
  );

  const manifest = JSON.parse(manifestSource);
  const packageMetadata = JSON.parse(packageSource);
  const designSkills = manifest.products.find((product) => product.id === "design-skills");
  assert.ok(designSkills, "Canonical Design Skills product is required");
  assert.equal(manifest.brandRevision, 3);
  assert.equal(designSkills.name, "memi Design Skills");
  assert.equal(designSkills.status, "available");
  assert.equal(
    designSkills.role,
    "Governed catalog of portable and capability-gated design workflows for coding agents.",
  );

  assert.match(readme, /^# memi Design Skills$/m);
  assert.ok(readme.includes(designSkills.role));
  assert.match(readme, /\*\*Status:\*\* Available/);
  assert.ok(readme.includes(`](${designSkills.urls.install})`));
  assert.equal(packageMetadata.homepage, designSkills.urls.repository);
  assert.equal(
    packageMetadata.repository.url.replace(/^git\+/, "").replace(/\.git$/, ""),
    designSkills.urls.repository,
  );
  assert.equal(packageMetadata.license, designSkills.license.spdx);

  const legacyPackage = designSkills.packages.find(({ status }) => status === "legacy-compatibility");
  assert.ok(legacyPackage, "Canonical legacy package identity is required");
  assert.equal(packageMetadata.name, legacyPackage.name);
  assert.equal(packageMetadata.private, true);
  assert.ok(readme.includes(legacyPackage.name));
  assert.ok(readme.includes(legacyPackage.note));

  const primaryIcon = designSkills.icons.find((icon) => icon.purpose === "primary");
  assert.ok(primaryIcon, "Canonical primary memi icon is required");
  assert.equal(primaryIcon.id, "memi-mark");
  assert.equal(sha256(localIcon), primaryIcon.sha256);
  assert.ok(readme.includes(primaryIcon.alt));
});

test("public catalog copy uses the memi organization and preserves the legacy package identifier", async () => {
  const [readme, packageSource, codeowners] = await Promise.all([
    read("README.md"),
    read("package.json"),
    read(".github/CODEOWNERS"),
  ]);
  const packageMetadata = JSON.parse(packageSource);

  assert.match(readme, /^# memi Design Skills$/m);
  assert.match(readme, /94 installable skills: 88 canonical workflows and 6 deprecated compatibility entries/);
  assert.match(readme, /portable skills layer for the memi ecosystem/);
  assert.match(readme, /^## Installation$/m);
  assert.match(readme, /npx skills@1\.5\.17 add memi-design\/design-skills --list/);
  assert.match(
    readme,
    /\[!\[Agent Skills\]\(https:\/\/skills\.sh\/b\/memi-design\/design-skills\)\]\(https:\/\/github\.com\/memi-design\/design-skills#installation\)/,
  );
  assert.doesNotMatch(readme, /\]\(https:\/\/skills\.sh\/memi-design\/design-skills\)/);
  assert.match(readme, /https:\/\/memoire\.cv/);
  assert.match(readme, /https:\/\/github\.com\/memi-design\/memi-studio/);
  assert.doesNotMatch(readme, /sarveshsea\/design-skills/);

  assert.equal(packageMetadata.name, "@memoire/design-skills");
  assert.equal(packageMetadata.homepage, "https://github.com/memi-design/design-skills");
  assert.equal(packageMetadata.repository.url, "git+https://github.com/memi-design/design-skills.git");
  assert.equal(packageMetadata.bugs.url, "https://github.com/memi-design/design-skills/issues");
  assert.match(readme, /`@memoire\/design-skills` remains a legacy repository-tooling identifier/);
  assert.doesNotMatch(codeowners, /@sarveshsea/);
  assert.match(codeowners, /@memi-design\/maintainers/);
});

test("ecosystem workflow docs use organization-owned operational links", async () => {
  const workflowFiles = [
    "skills/design-sandbox-proof/SKILL.md",
    "skills/interface-craft-gate/SKILL.md",
    "skills/memoire-design-tooling/SKILL.md",
    "skills/memoire-mcp-agent-skills/SKILL.md",
    "skills/memoire-studio-macos/SKILL.md",
    "skills/memoire-v2-surface-map/SKILL.md",
  ];
  const sources = await Promise.all(workflowFiles.map(read));

  for (const [index, source] of sources.entries()) {
    assert.doesNotMatch(source, /github\.com\/sarveshsea\//, workflowFiles[index]);
  }
  assert.match(sources.at(-1), /npx skills add memi-design\/design-skills/);
  assert.match(sources.at(-1), /https:\/\/memoire\.cv/);
});
