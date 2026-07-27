import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("default check enforces 90 percent line and branch coverage for new audit and routing logic", async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8"),
  );
  const auditCoverage = packageJson.scripts["test:coverage:audit"] ?? "";
  const routingCoverage = packageJson.scripts["test:coverage:routing"] ?? "";
  const validationCoverage =
    packageJson.scripts["test:coverage:validation"] ?? "";
  const coverage = packageJson.scripts["test:coverage"] ?? "";
  const check = packageJson.scripts.check ?? "";

  for (const command of [
    auditCoverage,
    routingCoverage,
    validationCoverage,
  ]) {
    assert.match(command, /c8 --check-coverage --per-file/);
    assert.match(command, /--lines 90/);
    assert.match(command, /--branches 90/);
  }
  assert.match(auditCoverage, /scripts\/audit-skills\.mjs/);
  assert.match(routingCoverage, /scripts\/evaluate-routing\.mjs/);
  assert.match(
    validationCoverage,
    /scripts\/validate-routing-exclusions\.mjs/,
  );
  assert.match(coverage, /npm run test:coverage:audit/);
  assert.match(coverage, /npm run test:coverage:routing/);
  assert.match(coverage, /npm run test:coverage:validation/);
  assert.match(check, /npm run test:coverage/);
  assert.equal(packageJson.engines.node, ">=20.19.0");
  assert.equal(packageJson.devDependencies.c8, "12.0.0");
});

test("hosted CI clean-installs both shader skills and verifies progressive references", async () => {
  const workflow = await readFile(
    path.join(root, ".github", "workflows", "ci.yml"),
    "utf8",
  );

  assert.match(
    workflow,
    /skills" add "\$GITHUB_WORKSPACE" --skill shader-design-engineering --agent codex --yes/,
  );
  assert.match(
    workflow,
    /test -f \.agents\/skills\/shader-design-engineering\/references\/webgl2-glsl\.md/,
  );
  assert.match(
    workflow,
    /skills" add "\$GITHUB_WORKSPACE" --skill creative-rendering-audit --agent codex --yes/,
  );
  assert.match(
    workflow,
    /test -f \.agents\/skills\/creative-rendering-audit\/references\/audit-rubric\.md/,
  );
  assert.equal(
    workflow.match(/mktemp -d/g)?.length,
    2,
    "each skill must install into its own clean destination",
  );
  assert.equal(
    workflow.match(
      /find \.agents\/skills -mindepth 1 -maxdepth 1 -type d \| wc -l/g,
    )?.length,
    2,
    "each clean install must prove that exactly one skill was installed",
  );
});
