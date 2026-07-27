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
  evaluateRoutingBenchmark,
  loadRoutingCatalog,
  routePrompt,
} from "../scripts/evaluate-routing.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function readFixture() {
  return JSON.parse(
    await readFile(
      path.join(root, "tests", "fixtures", "routing-prompts.json"),
      "utf8",
    ),
  );
}

async function minimalRoutingCatalog() {
  const fixtureRoot = await mkdtemp(
    path.join(os.tmpdir(), "design-skills-routing-"),
  );
  await mkdir(path.join(fixtureRoot, "registry"), { recursive: true });
  await mkdir(path.join(fixtureRoot, "skills", "minimal-route"), {
    recursive: true,
  });
  await writeFile(
    path.join(fixtureRoot, "registry", "skills.json"),
    `${JSON.stringify({
      schemaVersion: 2,
      skills: [{
        name: "minimal-route",
        displayName: "",
        visibility: "public",
        status: "canonical",
        routing: {
          intents: ["minimal-route"],
          role: "primary",
        },
      }],
    })}\n`,
  );
  await writeFile(
    path.join(fixtureRoot, "skills", "minimal-route", "SKILL.md"),
    "No frontmatter is available.",
  );
  return loadRoutingCatalog(fixtureRoot);
}

test("representative routing fixture is bounded and covers required categories", async () => {
  const fixture = await readFixture();
  const ids = fixture.cases.map((entry) => entry.id);
  const categories = new Set(fixture.cases.map((entry) => entry.category));

  assert.equal(fixture.schemaVersion, 1);
  assert.equal(fixture.minimumAccuracy, 1);
  assert.ok(fixture.cases.length >= 50);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(
    [...categories].sort(),
    [
      "creative-rendering",
      "design-catalog",
      "motion-animation-color",
      "negative-near-miss",
      "shader-dither",
      "swiftui",
    ],
  );
  assert.ok(
    fixture.cases.filter((entry) => entry.expected === null).length >= 9,
  );
});

test("catalog candidates retain validated routing exclusions", async () => {
  const catalog = await loadRoutingCatalog(root);
  const shader = catalog.find(
    (entry) => entry.name === "shader-design-engineering",
  );
  const renderingAudit = catalog.find(
    (entry) => entry.name === "creative-rendering-audit",
  );

  assert.deepEqual(shader.excludes, ["creative-rendering-audit"]);
  assert.ok(
    renderingAudit.excludes.includes("shader-design-engineering"),
    "audit and implementation owners must declare their boundary",
  );
});

test("deterministic catalog QA routing meets its declared accuracy gate", async () => {
  const fixture = await readFixture();
  const catalog = await loadRoutingCatalog(root);
  const routeOwners = new Set(catalog.map((entry) => entry.name));
  for (const entry of fixture.cases) {
    if (entry.expected !== null) {
      assert.ok(
        routeOwners.has(entry.expected),
        `${entry.id}: ${entry.expected} must be a public canonical primary route`,
      );
    }
  }
  const report = evaluateRoutingBenchmark(catalog, fixture);

  assert.equal(report.schemaVersion, 1);
  assert.equal(report.method, "deterministic-catalog-metadata-qa");
  assert.equal(report.total, fixture.cases.length);
  assert.equal(report.correct + report.incorrect, report.total);
  assert.equal(report.accuracy, report.correct / report.total);
  assert.equal(report.minimumAccuracy, fixture.minimumAccuracy);
  assert.ok(report.accuracy >= fixture.minimumAccuracy, report.summary);
  assert.equal(report.incorrect, 0, report.summary);
  assert.equal(report.cases.length, fixture.cases.length);

  for (const result of report.cases) {
    assert.equal(typeof result.id, "string");
    assert.equal(typeof result.correct, "boolean");
    assert.ok(Array.isArray(result.rankedCandidates));
    assert.ok(result.rankedCandidates.length <= 3);
  }
});

test("near-miss prompts abstain instead of claiming an unrelated design skill", async () => {
  const fixture = await readFixture();
  const catalog = await loadRoutingCatalog(root);
  const report = evaluateRoutingBenchmark(catalog, fixture);
  const negativeResults = report.cases.filter(
    (entry) => entry.category === "negative-near-miss",
  );

  assert.ok(negativeResults.length >= 5);
  for (const result of negativeResults) {
    assert.equal(result.expected, null);
    assert.equal(result.predicted, null, `${result.id}: ${result.confusion}`);
    assert.equal(result.correct, true);
  }
});

test("routing handles empty catalogs, explicit thresholds, and empty benchmarks", async () => {
  assert.deepEqual(routePrompt([], ""), {
    predicted: null,
    rankedCandidates: [],
  });

  const catalog = await loadRoutingCatalog(root);
  assert.equal(
    routePrompt(catalog, "Audit this WebGL2 shader.", {
      minimumScore: Number.POSITIVE_INFINITY,
      minimumMatchedFeatures: Number.POSITIVE_INFINITY,
    }).predicted,
    null,
  );

  const empty = evaluateRoutingBenchmark(catalog, {
    minimumAccuracy: 1,
    cases: [],
  });
  assert.equal(empty.total, 0);
  assert.equal(empty.accuracy, 0);
  assert.equal(empty.passed, false);

  const minimal = await minimalRoutingCatalog();
  assert.deepEqual(minimal[0].actions, []);
  assert.deepEqual(minimal[0].excludes, []);
  assert.equal(
    routePrompt(minimal, "minimal route").predicted,
    "minimal-route",
  );
});
