import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = path.resolve(import.meta.dirname, "..");

async function generatedSnapshot() {
  const folders = (await readdir(path.join(root, "skills"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const files = ["catalog.json", ...folders.map((folder) => `skills/${folder}/note.json`)];
  return Promise.all(files.map(async (file) => [file, await readFile(path.join(root, file), "utf8")]));
}

test("catalog synchronization is deterministic and idempotent", async () => {
  await execFileAsync(process.execPath, ["scripts/sync-catalog.mjs"], { cwd: root });
  const first = await generatedSnapshot();
  await execFileAsync(process.execPath, ["scripts/sync-catalog.mjs"], { cwd: root });
  const second = await generatedSnapshot();
  assert.deepEqual(second, first);
});
