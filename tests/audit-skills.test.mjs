import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { auditSkills, classifyVerdict } from "../scripts/audit-skills.mjs";

const root = path.resolve(import.meta.dirname, "..");

test("stocktake scores every registered skill with a decision-enabling verdict", async () => {
  const registry = JSON.parse(await readFile(path.join(root, "registry", "skills.json"), "utf8"));
  const audit = await auditSkills(root, new Date("2026-07-26T00:00:00.000Z"));
  const verdicts = new Set(["Keep", "Improve", "Update", "Retire"]);

  assert.equal(audit.skills.length, registry.skills.length);
  assert.equal(audit.methodology.maximumScore, 100);
  assert.ok(audit.skills.some((skill) => skill.name === "shader-design-engineering"));
  assert.ok(audit.skills.some((skill) => skill.name === "creative-rendering-audit"));

  for (const skill of audit.skills) {
    assert.ok(Number.isInteger(skill.score) && skill.score >= 0 && skill.score <= 100, skill.name);
    assert.equal(Object.values(skill.dimensions).reduce((total, value) => total + value, 0), skill.score, skill.name);
    assert.ok(verdicts.has(skill.verdict) || /^Merge into [a-z][a-z0-9-]+$/.test(skill.verdict), skill.name);
    assert.ok(skill.reason.length >= 40, skill.name);
  }
});

test("stocktake is deterministic for a fixed evidence date", async () => {
  const asOf = new Date("2026-07-26T00:00:00.000Z");
  assert.deepEqual(await auditSkills(root, asOf), await auditSkills(root, asOf));
});

test("stocktake distinguishes evidence cutoff from completion time", async () => {
  const evidenceAsOf = new Date("2026-07-26T00:00:00.000Z");
  const auditedAt = new Date("2026-07-26T22:14:37.000Z");
  const audit = await auditSkills(root, evidenceAsOf, auditedAt);
  assert.equal(audit.evidenceAsOf, evidenceAsOf.toISOString());
  assert.equal(audit.auditedAt, auditedAt.toISOString());
});

test("stocktake emits a concrete merge target for a duplicate primary intent", () => {
  const entry = { name: "review-layout-v2", status: "canonical" };
  const dimensions = {
    triggerPrecision: 20,
    actionability: 20,
    freshness: 15,
    sourceQuality: 15,
    progressiveDisclosure: 10,
    installation: 10,
    uniqueness: 5,
  };
  assert.equal(classifyVerdict(entry, dimensions, "review-layout"), "Merge into review-layout");
});
