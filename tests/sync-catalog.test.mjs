import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function isolatedWorkspace() {
  const target = await mkdtemp(path.join(os.tmpdir(), "design-skills-sync-"));
  await Promise.all([
    cp(path.join(root, "skills"), path.join(target, "skills"), { recursive: true }),
    cp(path.join(root, "registry"), path.join(target, "registry"), { recursive: true }),
    cp(path.join(root, "README.md"), path.join(target, "README.md")),
    cp(path.join(root, "provenance.json"), path.join(target, "provenance.json")),
  ]);
  await writeFile(path.join(target, "catalog.json"), '{"schemaVersion":0,"skills":[]}\n');
  return target;
}

async function generatedSnapshot(workspace = root) {
  const folders = (await readdir(path.join(workspace, "skills"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const files = ["catalog.json", ...folders.map((folder) => `skills/${folder}/note.json`)];
  return Promise.all(files.map(async (file) => [file, await readFile(path.join(workspace, file), "utf8")]));
}

test("catalog synchronization can target an isolated workspace", async () => {
  const workspace = await isolatedWorkspace();
  await execFileAsync(process.execPath, ["scripts/sync-catalog.mjs", "--root", workspace], { cwd: root });
  const catalog = JSON.parse(await readFile(path.join(workspace, "catalog.json"), "utf8"));
  assert.equal(catalog.schemaVersion, 2);
  assert.equal(catalog.skills.length, 94);
});

test("catalog synchronization is deterministic and idempotent", async () => {
  const workspace = await isolatedWorkspace();
  await execFileAsync(process.execPath, ["scripts/sync-catalog.mjs", "--root", workspace], { cwd: root });
  const first = await generatedSnapshot(workspace);
  await execFileAsync(process.execPath, ["scripts/sync-catalog.mjs", "--root", workspace], { cwd: root });
  const second = await generatedSnapshot(workspace);
  assert.deepEqual(second, first);
});

test("catalog synchronization keeps the public skill count current", async () => {
  const workspace = await isolatedWorkspace();
  await execFileAsync(process.execPath, ["scripts/sync-catalog.mjs", "--root", workspace], { cwd: root });
  const catalog = JSON.parse(await readFile(path.join(workspace, "catalog.json"), "utf8"));
  const readme = await readFile(path.join(workspace, "README.md"), "utf8");
  const canonical = catalog.skills.filter((entry) => entry.status === "canonical").length;
  const deprecated = catalog.skills.filter((entry) => entry.status === "deprecated").length;
  assert.match(readme, new RegExp(`${catalog.skills.length} installable skills: ${canonical} canonical workflows and ${deprecated} deprecated compatibility entries`));
});
