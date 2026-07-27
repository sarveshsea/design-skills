import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  auditSkills,
  buildVerdictReason,
  classifyVerdict,
  daysBetween,
  findLocalReferences,
  isValidHttpsSource,
  parseSkillFrontmatter,
  renderAuditMarkdown,
} from "../scripts/audit-skills.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function degradedAuditFixture() {
  const fixtureRoot = await mkdtemp(
    path.join(os.tmpdir(), "design-skills-audit-"),
  );
  await mkdir(path.join(fixtureRoot, "skills", "thin-skill"), {
    recursive: true,
  });
  await mkdir(path.join(fixtureRoot, "registry", "collections"), {
    recursive: true,
  });
  await writeFile(
    path.join(fixtureRoot, "skills", "thin-skill", "SKILL.md"),
    [
      "---",
      "name: thin-skill",
      "description: Thin.",
      "---",
      "",
      "# Thin",
      "",
      "[Missing](references/missing.md)",
      "",
    ].join("\n"),
  );
  await writeFile(
    path.join(fixtureRoot, "skills", "thin-skill", "note.json"),
    `${JSON.stringify({
      name: "wrong-name",
      skills: [],
      dependencies: [],
    })}\n`,
  );
  await writeFile(
    path.join(fixtureRoot, "registry", "skills.json"),
    `${JSON.stringify({
      schemaVersion: 2,
      skills: [{
        name: "thin-skill",
        displayName: "Thin Skill",
        status: "quarantined",
        visibility: "internal",
        routing: {
          intents: ["thin-one", "thin-two"],
          role: "reference",
          excludes: [],
        },
        sourceUrls: ["not a URL"],
        lastResearchedAt: "invalid",
        collectionIds: ["missing"],
      }],
    }, null, 2)}\n`,
  );
  await writeFile(
    path.join(fixtureRoot, "registry", "collections", "empty.json"),
    `${JSON.stringify({ id: "empty", include: [] }, null, 2)}\n`,
  );
  await writeFile(
    path.join(fixtureRoot, "provenance.json"),
    `${JSON.stringify({ schemaVersion: 1 }, null, 2)}\n`,
  );
  return fixtureRoot;
}

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

test("stocktake parsing helpers reject malformed evidence and preserve local references", () => {
  assert.deepEqual(parseSkillFrontmatter("not frontmatter"), {
    name: "",
    description: "",
    body: "not frontmatter",
  });
  assert.equal(
    parseSkillFrontmatter(
      "---\nname: shader-test\ndescription: \"Use when testing shaders.\"\n---\n\nBody.\n",
    ).description,
    "Use when testing shaders.",
  );
  assert.equal(isValidHttpsSource("https://example.com/reference"), true);
  assert.equal(isValidHttpsSource("http://example.com/reference"), false);
  assert.equal(isValidHttpsSource("not a URL"), false);
  assert.equal(
    daysBetween("invalid", new Date("2026-07-26T00:00:00.000Z")),
    Number.POSITIVE_INFINITY,
  );
  assert.equal(
    daysBetween("2026-07-27T00:00:00.000Z", new Date("2026-07-26T00:00:00.000Z")),
    0,
  );
  assert.deepEqual(
    findLocalReferences(
      "[Local](references/guide.md#part) [Remote](https://example.com/guide.md)",
    ),
    ["references/guide.md"],
  );
});

test("stocktake verdicts and reasons cover every disposition boundary", () => {
  const complete = {
    triggerPrecision: 20,
    actionability: 20,
    freshness: 15,
    sourceQuality: 15,
    progressiveDisclosure: 10,
    installation: 10,
    uniqueness: 10,
  };
  const entry = { name: "shader-test", status: "canonical" };

  assert.equal(
    classifyVerdict({ ...entry, status: "deprecated" }, complete),
    "Retire",
  );
  assert.equal(classifyVerdict(entry, complete, "shader-owner"), "Merge into shader-owner");
  assert.equal(
    classifyVerdict(entry, { ...complete, sourceQuality: 5 }),
    "Retire",
  );
  assert.equal(
    classifyVerdict(entry, { ...complete, freshness: 2 }),
    "Update",
  );
  assert.equal(classifyVerdict(entry, complete), "Keep");
  assert.equal(
    classifyVerdict(entry, { ...complete, triggerPrecision: 10 }),
    "Improve",
  );

  assert.match(
    buildVerdictReason(
      { ...entry, status: "deprecated", replacement: "shader-owner" },
      complete,
      0,
      "Retire",
      null,
      [],
    ),
    /Retire this alias/,
  );
  assert.match(
    buildVerdictReason(
      entry,
      complete,
      0,
      "Merge into shader-owner",
      "shader-owner",
      ["shader-design"],
    ),
    /Merge this skill/,
  );
  assert.match(
    buildVerdictReason(entry, complete, 0, "Keep", null, []),
    /retain as a distinct canonical skill/,
  );
  assert.match(
    buildVerdictReason(
      entry,
      { ...complete, actionability: 10 },
      0,
      "Keep",
      null,
      [],
    ),
    /minor follow-ups/,
  );
  assert.match(
    buildVerdictReason(
      entry,
      {
        triggerPrecision: 0,
        actionability: 0,
        freshness: 0,
        sourceQuality: 0,
        progressiveDisclosure: 0,
        installation: 0,
        uniqueness: 0,
      },
      Number.POSITIVE_INFINITY,
      "Improve",
      null,
      [],
    ),
    /invalid date/,
  );
});

test("stocktake markdown renders summary, rubric, and escaped result rows", async () => {
  const audit = await auditSkills(
    root,
    new Date("2026-07-26T00:00:00.000Z"),
    new Date("2026-07-26T22:14:37.000Z"),
  );
  const markdown = renderAuditMarkdown({
    ...audit,
    skills: [{
      ...audit.skills[0],
      reason: "Evidence | escaped",
    }],
  });

  assert.match(markdown, /^# Canonical Design Skill Stocktake/m);
  assert.match(markdown, /Evidence date: 2026-07-26/);
  assert.match(markdown, /Trigger precision/);
  assert.match(markdown, /Evidence \\\\| escaped/);
});

test("stocktake gives no assumed credit to malformed and missing evidence", async () => {
  const fixtureRoot = await degradedAuditFixture();
  const audit = await auditSkills(
    fixtureRoot,
    new Date("2026-07-26T00:00:00.000Z"),
  );
  const [skill] = audit.skills;

  assert.equal(skill.verdict, "Retire");
  assert.equal(skill.dimensions.actionability, 0);
  assert.equal(skill.dimensions.freshness, 0);
  assert.equal(skill.dimensions.sourceQuality, 0);
  assert.equal(skill.dimensions.installation, 0);
  assert.equal(skill.evidence.localReferences, 1);
  assert.equal(skill.evidence.ageDays, null);
  assert.match(skill.reason, /invalid date/);
});
