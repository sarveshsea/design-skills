const NAME_PATTERN = /^[a-z][a-z0-9-]{0,62}[a-z0-9]$/;

export function validateRoutingExclusions(entry, entries, prefix) {
  const issues = [];
  const exclusions = entry.routing?.excludes;
  if (!Array.isArray(exclusions)) {
    return [`${prefix}: routing exclusions must be an array`];
  }

  if (new Set(exclusions).size !== exclusions.length) {
    issues.push(`${prefix}: routing exclusions must be unique`);
  }

  for (const exclusion of exclusions) {
    if (!NAME_PATTERN.test(exclusion)) {
      issues.push(
        `${prefix}: routing exclusion ${exclusion} must be a controlled kebab-case skill id`,
      );
      continue;
    }
    if (exclusion === entry.name) {
      issues.push(`${prefix}: routing cannot exclude itself`);
      continue;
    }

    const target = entries.find((candidate) => candidate.name === exclusion);
    if (!target) {
      issues.push(`${prefix}: unknown routing exclusion ${exclusion}`);
    } else if (
      target.visibility !== "public" ||
      target.status !== "canonical" ||
      target.routing?.role !== "primary"
    ) {
      issues.push(
        `${prefix}: routing exclusion ${exclusion} must target a public canonical primary route`,
      );
    }
  }

  return issues;
}
