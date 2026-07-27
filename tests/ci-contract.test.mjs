import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");

test("default check enforces 90 percent line and branch coverage for new audit and routing logic", async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8"),
  );
  const coverage = packageJson.scripts["test:coverage"] ?? "";
  const check = packageJson.scripts.check ?? "";

  assert.match(coverage, /--test-coverage-lines=90/);
  assert.match(coverage, /--test-coverage-branches=90/);
  assert.match(coverage, /scripts\/audit-skills\.mjs/);
  assert.match(coverage, /scripts\/evaluate-routing\.mjs/);
  assert.match(check, /npm run test:coverage/);
});

test("hosted CI clean-installs both shader skills and verifies progressive references", async () => {
  const workflow = await readFile(
    path.join(root, ".github", "workflows", "ci.yml"),
    "utf8",
  );

  assert.match(
    workflow,
    /skills add \. --skill shader-design-engineering --agent codex --yes/,
  );
  assert.match(
    workflow,
    /test -f \.agents\/skills\/shader-design-engineering\/references\/webgl2-glsl\.md/,
  );
  assert.match(
    workflow,
    /skills add \. --skill creative-rendering-audit --agent codex --yes/,
  );
  assert.match(
    workflow,
    /test -f \.agents\/skills\/creative-rendering-audit\/references\/audit-rubric\.md/,
  );
});
