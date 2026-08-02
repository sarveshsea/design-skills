import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

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
  assert.match(readme, /npx skills@1\.5\.17 add memi-design\/design-skills --list/);
  assert.match(readme, /https:\/\/skills\.sh\/memi-design\/design-skills/);
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
