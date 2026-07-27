import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  evaluateRoutingBenchmark,
  loadRoutingCatalog,
} from "./evaluate-routing.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = JSON.parse(
  await readFile(
    path.join(root, "tests", "fixtures", "routing-prompts.json"),
    "utf8",
  ),
);
const catalog = await loadRoutingCatalog(root);
const report = evaluateRoutingBenchmark(catalog, fixture);

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log(`Catalog routing QA: ${report.summary}`);
  console.log(report.scope);
  for (const result of report.cases.filter((entry) => !entry.correct)) {
    const candidates = result.rankedCandidates
      .map((candidate) => `${candidate.name} (${candidate.score})`)
      .join(", ");
    console.log(
      `- ${result.id}: ${result.confusion}; candidates: ${candidates || "none"}`,
    );
  }
}

if (!report.passed) process.exitCode = 1;
