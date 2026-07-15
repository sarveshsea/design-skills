import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

test("core remains a bounded portable lifecycle profile", async () => {
  const registry = await readJson("registry/skills.json");
  const core = await readJson("registry/collections/core.json");
  const byName = new Map(registry.skills.map((entry) => [entry.name, entry]));
  assert.equal(core.include.length, 15);
  for (const name of core.include) {
    const entry = byName.get(name);
    assert.equal(entry.visibility, "public", name);
    assert.equal(entry.status, "canonical", name);
    assert.equal(entry.maturity, "stable", name);
    assert.equal(entry.runtime.portability, "portable", name);
  }
});

test("accessibility metadata remains aligned with its audit workflow", async () => {
  const registry = await readJson("registry/skills.json");
  const entry = registry.skills.find((skill) => skill.name === "accessibility-audit");
  assert.deepEqual(entry.lifecycle, ["validate"]);
  assert.deepEqual(entry.actions, ["audit"]);
  assert.ok(entry.domains.includes("accessibility"));
  assert.equal(entry.runtime.portability, "portable");
});

test("public registry contains no quarantined payloads", async () => {
  const registry = await readJson("registry/skills.json");
  assert.deepEqual(registry.skills.filter((entry) => entry.status === "quarantined"), []);
});

test("catalog spans the complete design lifecycle", async () => {
  const registry = await readJson("registry/skills.json");
  const stages = new Set(registry.skills.flatMap((entry) => entry.lifecycle));
  assert.deepEqual([...stages].sort(), ["define", "deliver", "design", "discover", "measure", "operate", "prototype", "validate"]);
});

test("link-only Figma routers preserve local authorship and official references", async () => {
  const catalog = await readJson("catalog.json");
  const registry = await readJson("registry/skills.json");
  const names = ["figma-code-connect", "figma-create-file", "figma-design-systems", "figma-ds-rules", "figma-implement-design", "figma-library-builder", "figma-plugin-api"];
  for (const name of names) {
    const catalogEntry = catalog.skills.find((entry) => entry.name === name);
    const registryEntry = registry.skills.find((entry) => entry.name === name);
    assert.equal(catalogEntry.author, "Sarvesh Chidambaram", name);
    assert.equal(catalogEntry.relationship, "first-party-in-repository", name);
    assert.equal(catalogEntry.officialReferences[0].organization, "Figma, Inc.", name);
    assert.ok(registryEntry.sourceUrls.includes("https://github.com/figma/mcp-server-guide"), name);
  }
});
