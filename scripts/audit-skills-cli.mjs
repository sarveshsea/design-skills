import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  auditSkills,
  renderAuditMarkdown,
} from "./audit-skills.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const asOfIndex = process.argv.indexOf("--as-of");
const asOfArgument = asOfIndex === -1 ? null : process.argv[asOfIndex + 1];
const asOfValue = asOfArgument === null
  ? new Date()
  : new Date(`${asOfArgument}T00:00:00.000Z`);

if (Number.isNaN(asOfValue.getTime())) {
  throw new Error("--as-of must be YYYY-MM-DD");
}

const audit = await auditSkills(root, asOfValue, new Date());
const date = audit.evidenceAsOf.slice(0, 10);
const auditDir = path.join(root, "docs", "audits");
await mkdir(auditDir, { recursive: true });
await writeFile(
  path.join(auditDir, `skill-stocktake-${date}.json`),
  `${JSON.stringify(audit, null, 2)}\n`,
);
await writeFile(
  path.join(auditDir, `skill-stocktake-${date}.md`),
  renderAuditMarkdown(audit),
);
console.log(
  `Audited ${audit.summary.totalSkills} skills at ${audit.summary.meanScore}/100 mean; wrote docs/audits/skill-stocktake-${date}.{json,md}.`,
);
