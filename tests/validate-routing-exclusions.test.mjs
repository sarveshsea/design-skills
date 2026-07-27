import assert from "node:assert/strict";
import test from "node:test";

import {
  validateRoutingExclusions,
} from "../scripts/validate-routing-exclusions.mjs";

function route(name, overrides = {}) {
  return {
    name,
    visibility: "public",
    status: "canonical",
    routing: {
      role: "primary",
      excludes: [],
    },
    ...overrides,
  };
}

test("routing exclusions accept unique public canonical primary targets", () => {
  const target = route("shader-design-engineering");
  const entry = route("creative-rendering-audit", {
    routing: {
      role: "primary",
      excludes: ["shader-design-engineering"],
    },
  });

  assert.deepEqual(
    validateRoutingExclusions(entry, [entry, target], "creative"),
    [],
  );
});

test("routing exclusions reject malformed container and values", () => {
  const target = route("shader-design-engineering");

  assert.deepEqual(
    validateRoutingExclusions(
      route("creative-rendering-audit", {
        routing: { role: "primary", excludes: null },
      }),
      [target],
      "creative",
    ),
    ["creative: routing exclusions must be an array"],
  );

  const entry = route("creative-rendering-audit", {
    routing: {
      role: "primary",
      excludes: [
        "Bad Route",
        "creative-rendering-audit",
        "missing-route",
        "shader-design-engineering",
        "shader-design-engineering",
      ],
    },
  });
  const issues = validateRoutingExclusions(
    entry,
    [entry, target],
    "creative",
  );

  assert.ok(issues.includes("creative: routing exclusions must be unique"));
  assert.ok(
    issues.includes(
      "creative: routing exclusion Bad Route must be a controlled kebab-case skill id",
    ),
  );
  assert.ok(issues.includes("creative: routing cannot exclude itself"));
  assert.ok(issues.includes("creative: unknown routing exclusion missing-route"));
});

test("routing exclusions reject targets outside the public canonical primary surface", () => {
  for (const target of [
    route("private-route", { visibility: "internal" }),
    route("deprecated-route", { status: "deprecated" }),
    route("reference-route", {
      routing: { role: "reference", excludes: [] },
    }),
  ]) {
    const entry = route("source-route", {
      routing: { role: "primary", excludes: [target.name] },
    });
    assert.deepEqual(
      validateRoutingExclusions(entry, [entry, target], "source"),
      [
        `source: routing exclusion ${target.name} must target a public canonical primary route`,
      ],
    );
  }
});
