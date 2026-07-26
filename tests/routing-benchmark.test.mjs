import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  evaluateRoutingBenchmark,
  loadRoutingCatalog,
} from "../scripts/evaluate-routing.mjs";

const root = path.resolve(import.meta.dirname, "..");

async function readFixture() {
  return JSON.parse(
    await readFile(
      path.join(root, "tests", "fixtures", "routing-prompts.json"),
      "utf8",
    ),
  );
}

test("representative routing fixture is bounded and covers required categories", async () => {
  const fixture = await readFixture();
  const ids = fixture.cases.map((entry) => entry.id);
  const categories = new Set(fixture.cases.map((entry) => entry.category));

  assert.equal(fixture.schemaVersion, 1);
  assert.equal(fixture.minimumAccuracy, 1);
  assert.ok(fixture.cases.length >= 40);
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
    fixture.cases.filter((entry) => entry.expected === null).length >= 5,
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
