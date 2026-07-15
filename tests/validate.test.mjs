import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { validateRepository } from "../scripts/validate.mjs";

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "design-skills-validator-"));
  await mkdir(path.join(root, "skills", "review-layout"), { recursive: true });
  await mkdir(path.join(root, "registry", "collections"), { recursive: true });
  await writeFile(
    path.join(root, "skills", "review-layout", "SKILL.md"),
    [
      "---",
      "name: review-layout",
      "description: Review interface layout when an agent needs hierarchy, spacing, or responsive design guidance.",
      "---",
      "",
      "# Review layout",
      "",
      "Inspect the interface and report evidence-backed improvements.",
      "",
    ].join("\n"),
  );
  await writeFile(
    path.join(root, "catalog.json"),
    `${JSON.stringify({ schemaVersion: 2, skills: [{
      name: "review-layout",
      type: "workflow",
      lifecycle: ["validate"],
      domains: ["visual"],
      actions: ["review"],
      surfaces: ["web"],
      maturity: "stable",
      freedomLevel: "medium",
      visibility: "public",
      status: "canonical",
      routing: { intents: ["review-interface-layout"], role: "primary", excludes: [] },
      runtime: { portability: "portable", requires: [], optional: [], fallback: "Use static artifacts supplied by the user." },
      dependencies: [],
      related: [],
      collectionIds: ["core"],
      version: "1.0.0",
      category: "craft",
      origin: "memoire",
      license: "MIT",
      source: "https://example.com/source",
      sourceRevision: "0123456789abcdef0123456789abcdef01234567",
      upstreamCommit: "0123456789abcdef0123456789abcdef01234567",
    }] }, null, 2)}\n`,
  );
  await writeFile(path.join(root, "LICENSE"), "MIT License\n");
  await writeFile(
    path.join(root, "provenance.json"),
    `${JSON.stringify({ schemaVersion: 1, sources: { memoire: {
      author: "Test Author",
      repository: "https://example.com/source",
      commit: "0123456789abcdef0123456789abcdef01234567",
      license: "MIT",
      licenseFile: "LICENSE",
      relationship: "first-party",
      skills: ["review-layout"],
    } } })}\n`,
  );
  await writeFile(
    path.join(root, "skills", "review-layout", "note.json"),
    `${JSON.stringify({
      name: "review-layout",
      version: "1.0.0",
      description: "Review interface layout when an agent needs hierarchy, spacing, or responsive design guidance.",
      author: "Test Author",
      category: "craft",
      sourceUrls: ["https://example.com/source"],
      lastResearchedAt: "2026-07-15T00:00:00.000Z",
      freshnessDays: 90,
      skills: [{ file: "SKILL.md", activateOn: "review-interface-layout", freedomLevel: "medium" }],
    })}\n`,
  );
  await writeFile(
    path.join(root, "registry", "skills.json"),
    `${JSON.stringify({ schemaVersion: 2, skills: [{
      name: "review-layout",
      displayName: "Review Layout",
      type: "workflow",
      lifecycle: ["validate"],
      domains: ["visual"],
      actions: ["review"],
      surfaces: ["web"],
      maturity: "stable",
      freedomLevel: "medium",
      visibility: "public",
      status: "canonical",
      routing: { intents: ["review-interface-layout"], role: "primary", excludes: [] },
      runtime: { portability: "portable", requires: [], optional: [], fallback: "Use static artifacts supplied by the user." },
      dependencies: [],
      related: [],
      collectionIds: ["core"],
      legacyCategory: "craft",
      version: "1.0.0",
      tags: ["layout", "responsive"],
      sourceUrls: ["https://example.com/source"],
      lastResearchedAt: "2026-07-15T00:00:00.000Z",
      freshnessDays: 365,
      engines: { memoire: ">=2.0.0" },
      createdAt: "2026-07-15T00:00:00.000Z",
      updatedAt: "2026-07-15T00:00:00.000Z"
    }] }, null, 2)}\n`,
  );
  await writeFile(
    path.join(root, "registry", "collections", "core.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      id: "core",
      title: "Core",
      description: "Portable stable design skills.",
      visibility: "public",
      defaultInstall: true,
      include: ["review-layout"],
      dependencyPolicy: "include-required"
    }, null, 2)}\n`,
  );
  return root;
}

async function updateRegistry(root, update) {
  const registryPath = path.join(root, "registry", "skills.json");
  const registry = JSON.parse(await readFile(registryPath, "utf8"));
  update(registry);
  await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
}

test("accepts a complete, catalogued skill", async () => {
  const root = await fixture();
  assert.deepEqual(await validateRepository(root), []);
});

test("rejects extra frontmatter keys and a catalog mismatch", async () => {
  const root = await fixture();
  const skillPath = path.join(root, "skills", "review-layout", "SKILL.md");
  await writeFile(
    skillPath,
    [
      "---",
      "name: review-layout",
      "description: Review interface layout when an agent needs hierarchy, spacing, or responsive design guidance.",
      "model: opus",
      "---",
      "",
      "# Review layout",
      "",
    ].join("\n"),
  );
  await writeFile(path.join(root, "catalog.json"), `${JSON.stringify({ schemaVersion: 1, skills: [] })}\n`);

  const issues = await validateRepository(root);
  assert.ok(issues.some((issue) => issue.includes("unsupported frontmatter key: model")));
  assert.ok(issues.some((issue) => issue.includes("missing from catalog.json")));
});

test("rejects missing references and invalid note manifests", async () => {
  const root = await fixture();
  const skillDir = path.join(root, "skills", "review-layout");
  await writeFile(
    path.join(skillDir, "SKILL.md"),
    [
      "---",
      "name: review-layout",
      "description: Review interface layout when an agent needs hierarchy, spacing, or responsive design guidance.",
      "---",
      "",
      "# Review layout",
      "",
      "Read [the rubric](references/rubric.md).",
      "",
    ].join("\n"),
  );
  await writeFile(path.join(skillDir, "note.json"), `${JSON.stringify({ name: "wrong-name", skills: [] })}\n`);

  const issues = await validateRepository(root);
  assert.ok(issues.some((issue) => issue.includes("missing local reference")));
  assert.ok(issues.some((issue) => issue.includes("note.json name must match folder")));
  assert.ok(issues.some((issue) => issue.includes("note.json skills must reference SKILL.md")));
});

test("requires every skill to be installable as a Memoire Note", async () => {
  const root = await fixture();
  await import("node:fs/promises").then(({ rm }) => rm(path.join(root, "skills", "review-layout", "note.json")));
  const issues = await validateRepository(root);
  assert.ok(issues.some((issue) => issue.includes("note.json is required")));
});

test("rejects catalog entries without immutable provenance", async () => {
  const root = await fixture();
  const catalog = JSON.parse(await readFile(path.join(root, "catalog.json"), "utf8"));
  catalog.skills[0].origin = "unknown-source";
  await writeFile(path.join(root, "catalog.json"), `${JSON.stringify(catalog)}\n`);
  const issues = await validateRepository(root);
  assert.ok(issues.some((issue) => issue.includes("unknown provenance origin")));
});

test("rejects symlinks inside distributable skill folders", async () => {
  const root = await fixture();
  await symlink("SKILL.md", path.join(root, "skills", "review-layout", "linked-skill.md"));
  const issues = await validateRepository(root);
  assert.ok(issues.some((issue) => issue.includes("symbolic links are not allowed")));
});

test("rejects circular Note dependencies", async () => {
  const root = await fixture();
  const notePath = path.join(root, "skills", "review-layout", "note.json");
  const note = JSON.parse(await readFile(notePath, "utf8"));
  note.dependencies = ["review-layout"];
  await writeFile(notePath, `${JSON.stringify(note)}\n`);
  const issues = await validateRepository(root);
  assert.ok(issues.some((issue) => issue.includes("dependency cycle")));
});

test("rejects broad always activation and duplicate primary intent owners", async () => {
  const root = await fixture();
  const source = path.join(root, "skills", "review-layout");
  const target = path.join(root, "skills", "audit-layout");
  await import("node:fs/promises").then(({ cp }) => cp(source, target, { recursive: true }));
  await writeFile(path.join(target, "SKILL.md"), [
    "---",
    "name: audit-layout",
    "description: Audit layout quality. Use when an interface needs a bounded visual layout audit.",
    "---",
    "",
    "# Audit layout",
    "",
    "Audit the supplied interface.",
    "",
  ].join("\n"));
  const note = JSON.parse(await readFile(path.join(target, "note.json"), "utf8"));
  note.name = "audit-layout";
  note.description = "Audit layout quality. Use when an interface needs a bounded visual layout audit.";
  note.skills[0].activateOn = "always";
  await writeFile(path.join(target, "note.json"), `${JSON.stringify(note, null, 2)}\n`);
  await updateRegistry(root, (registry) => {
    registry.skills[0].routing.intents = ["always"];
    registry.skills.push({ ...structuredClone(registry.skills[0]), name: "audit-layout", displayName: "Audit Layout" });
  });
  const catalog = JSON.parse(await readFile(path.join(root, "catalog.json"), "utf8"));
  catalog.skills.push({ ...catalog.skills[0], name: "audit-layout" });
  await writeFile(path.join(root, "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
  const provenance = JSON.parse(await readFile(path.join(root, "provenance.json"), "utf8"));
  provenance.sources.memoire.skills.push("audit-layout");
  await writeFile(path.join(root, "provenance.json"), `${JSON.stringify(provenance, null, 2)}\n`);

  const issues = await validateRepository(root);
  assert.ok(issues.some((issue) => issue.includes("always")));
  assert.ok(issues.some((issue) => issue.includes("primary routing intent")));
});

test("rejects quarantined skills in public collections", async () => {
  const root = await fixture();
  await updateRegistry(root, (registry) => {
    registry.skills[0].status = "quarantined";
    registry.skills[0].collectionIds = ["core"];
  });
  const issues = await validateRepository(root);
  assert.ok(issues.some((issue) => issue.includes("quarantined") && issue.includes("core")));
});

test("requires unknown redistribution rights to remain quarantined", async () => {
  const root = await fixture();
  const provenancePath = path.join(root, "provenance.json");
  const provenance = JSON.parse(await readFile(provenancePath, "utf8"));
  provenance.sources.memoire.relationship = "quarantined-adaptation";
  provenance.sources.memoire.permissions = { redistribution: "unknown", evidence: "No redistribution grant recorded." };
  await writeFile(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
  const issues = await validateRepository(root);
  assert.ok(issues.some((issue) => issue.includes("redistribution") && issue.includes("quarantined")));
});

test("rejects unknown facets and capability-gated skills without requirements", async () => {
  const root = await fixture();
  await updateRegistry(root, (registry) => {
    registry.skills[0].lifecycle = ["brainstorm"];
    registry.skills[0].runtime.portability = "capability-gated";
    registry.skills[0].runtime.requires = [];
  });
  const issues = await validateRepository(root);
  assert.ok(issues.some((issue) => issue.includes("unknown lifecycle")));
  assert.ok(issues.some((issue) => issue.includes("capability-gated") && issue.includes("requires")));
});

test("requires deprecated skills to resolve directly to a canonical replacement", async () => {
  const root = await fixture();
  await updateRegistry(root, (registry) => {
    registry.skills[0].status = "deprecated";
    registry.skills[0].replacement = "missing-skill";
    registry.skills[0].routing.role = "reference";
    registry.skills[0].collectionIds = [];
  });
  const collectionPath = path.join(root, "registry", "collections", "core.json");
  const collection = JSON.parse(await readFile(collectionPath, "utf8"));
  collection.include = [];
  await writeFile(collectionPath, `${JSON.stringify(collection, null, 2)}\n`);
  const issues = await validateRepository(root);
  assert.ok(issues.some((issue) => issue.includes("replacement") && issue.includes("missing-skill")));
});

test("rejects generated catalog drift from the canonical registry", async () => {
  const root = await fixture();
  await updateRegistry(root, (registry) => {
    registry.skills[0].maturity = "beta";
  });
  const issues = await validateRepository(root);
  assert.ok(issues.some((issue) => issue.includes("catalog.json") && issue.includes("maturity")));
});

test("rejects unquoted description values containing YAML-significant colons", async () => {
  const root = await fixture();
  const skillPath = path.join(root, "skills", "review-layout", "SKILL.md");
  const content = await readFile(skillPath, "utf8");
  await writeFile(skillPath, content.replace(
    "description: Review interface layout when an agent needs hierarchy, spacing, or responsive design guidance.",
    "description: Review layout safely. Deprecated: use a replacement workflow.",
  ));
  const issues = await validateRepository(root);
  assert.ok(issues.some((issue) => issue.includes("quote description") && issue.includes("YAML")));
});

test("rejects high freedom and missing approvals for write-capable skills", async () => {
  const root = await fixture();
  await updateRegistry(root, (registry) => {
    registry.skills[0].freedomLevel = "high";
    registry.skills[0].runtime = { portability: "capability-gated", requires: ["figma.write"], optional: [], fallback: "Use a screenshot." };
  });
  const issues = await validateRepository(root);
  assert.ok(issues.some((issue) => issue.includes("high freedomLevel")));
  assert.ok(issues.some((issue) => issue.includes("runtime.approval")));
});

test("rejects license evidence outside the repository", async () => {
  const root = await fixture();
  const provenancePath = path.join(root, "provenance.json");
  const provenance = JSON.parse(await readFile(provenancePath, "utf8"));
  provenance.sources.memoire.licenseFile = "/etc/hosts";
  await writeFile(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
  const issues = await validateRepository(root);
  assert.ok(issues.some((issue) => issue.includes("repository-contained relative file")));
});
