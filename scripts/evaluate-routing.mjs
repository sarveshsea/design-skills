import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "can",
  "could",
  "do",
  "does",
  "for",
  "from",
  "how",
  "i",
  "in",
  "into",
  "is",
  "it",
  "make",
  "my",
  "of",
  "on",
  "or",
  "our",
  "please",
  "should",
  "so",
  "that",
  "the",
  "their",
  "these",
  "this",
  "to",
  "we",
  "what",
  "when",
  "with",
]);

const TOKEN_ALIASES = new Map([
  ["a11y", "accessibility"],
  ["animated", "animation"],
  ["animations", "animation"],
  ["colours", "color"],
  ["dithered", "dither"],
  ["dithering", "dither"],
  ["effects", "effect"],
  ["errors", "error"],
  ["fallbacks", "fallback"],
  ["fonts", "font"],
  ["gestures", "gesture"],
  ["interfaces", "interface"],
  ["labels", "label"],
  ["materials", "material"],
  ["microinteractions", "microinteraction"],
  ["particles", "particle"],
  ["previews", "preview"],
  ["shaders", "shader"],
  ["states", "state"],
  ["systems", "system"],
  ["tokens", "token"],
  ["transitions", "transition"],
  ["workflows", "workflow"],
]);

const ACTION_ALIASES = new Map([
  ["add", "create"],
  ["adopt", "integrate"],
  ["assess", "audit"],
  ["build", "create"],
  ["check", "audit"],
  ["create", "create"],
  ["debug", "review"],
  ["design", "create"],
  ["evaluate", "audit"],
  ["fix", "review"],
  ["implement", "create"],
  ["inspect", "audit"],
  ["integrate", "integrate"],
  ["refactor", "review"],
  ["review", "review"],
  ["rewrite", "create"],
  ["survey", "analyze"],
]);

const ACTION_WORDS = new Set([
  ...ACTION_ALIASES.keys(),
  ...ACTION_ALIASES.values(),
]);

const AMBIGUOUS_CONTEXT_TOKENS = new Set([
  "api",
  "code",
  "color",
  "component",
  "design",
  "effect",
  "interface",
  "material",
  "metal",
  "motion",
  "performance",
  "render",
  "system",
  "token",
  "ui",
  "web",
]);

const FEATURE_WEIGHTS = Object.freeze({
  tag: 5,
  description: 2,
  action: 5,
  domain: 1,
  surface: 1,
});

const DEFAULT_MINIMUM_SCORE = 8;
const DEFAULT_MINIMUM_MATCHED_FEATURES = 2;
const PLATFORM_TERM_ALIASES = [
  [/\bwebgpu\b/gi, "webgpu"],
  [/\bwebgl2\b/gi, "webgl2"],
  [/\bswiftui\b/gi, "swiftui"],
];

function normalizeToken(rawToken) {
  const lower = rawToken.toLowerCase();
  if (TOKEN_ALIASES.has(lower)) return TOKEN_ALIASES.get(lower);
  if (lower.length > 4 && lower.endsWith("ies")) return `${lower.slice(0, -3)}y`;
  if (lower.length > 5 && lower.endsWith("ing")) return lower.slice(0, -3);
  if (lower.length > 4 && lower.endsWith("ed")) return lower.slice(0, -2);
  if (lower.length > 4 && lower.endsWith("s")) return lower.slice(0, -1);
  return lower;
}

function splitTokens(value) {
  const normalizedPlatforms = PLATFORM_TERM_ALIASES.reduce(
    (source, [pattern, replacement]) => source.replace(pattern, replacement),
    String(value ?? ""),
  );
  return normalizedPlatforms
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.map(normalizeToken)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token)) ?? [];
}

function addWeightedFeature(
  features,
  rawValue,
  tokenWeight,
  source,
  phraseWeight = tokenWeight + 2,
) {
  const tokens = splitTokens(rawValue);
  for (const token of tokens) {
    const existing = features.get(token);
    if (!existing || tokenWeight > existing.weight) {
      features.set(token, { key: token, weight: tokenWeight, source });
    }
  }
  if (tokens.length > 1) {
    const phrase = tokens.join(" ");
    const existing = features.get(phrase);
    if (!existing || phraseWeight > existing.weight) {
      features.set(phrase, { key: phrase, weight: phraseWeight, source });
    }
  }
}

function parseDescription(markdown) {
  const match = markdown.match(/^description:\s*(.+)$/m);
  return match?.[1]?.trim().replace(/^(['"])(.*)\1$/, "$2") ?? "";
}

function buildCandidate(entry, description) {
  const features = new Map();
  for (const intent of entry.routing.intents) {
    addWeightedFeature(features, intent, 3, "routing.intent", 10);
  }
  addWeightedFeature(features, entry.name, 3, "name", 9);
  addWeightedFeature(
    features,
    entry.displayName,
    2,
    "displayName",
    8,
  );
  for (const tag of entry.tags ?? []) {
    const tagTokenWeight =
      splitTokens(tag).length > 1 ? FEATURE_WEIGHTS.description : FEATURE_WEIGHTS.tag;
    addWeightedFeature(features, tag, tagTokenWeight, "tag", FEATURE_WEIGHTS.tag + 2);
  }
  addWeightedFeature(
    features,
    description,
    FEATURE_WEIGHTS.description,
    "description",
  );
  for (const action of entry.actions ?? []) {
    addWeightedFeature(features, action, FEATURE_WEIGHTS.action, "action");
  }
  for (const domain of entry.domains ?? []) {
    addWeightedFeature(features, domain, FEATURE_WEIGHTS.domain, "domain");
  }
  for (const surface of entry.surfaces ?? []) {
    addWeightedFeature(features, surface, FEATURE_WEIGHTS.surface, "surface");
  }
  return { name: entry.name, features };
}

function expandPrompt(prompt) {
  const tokens = splitTokens(prompt);
  const expandedTokens = new Set(tokens);
  const rawTokens =
    String(prompt).toLowerCase().match(/[a-z0-9]+/g)?.map(normalizeToken) ?? [];
  for (const token of rawTokens) {
    const action = ACTION_ALIASES.get(token);
    if (action) expandedTokens.add(action);
  }

  const phrases = new Set();
  for (let width = 2; width <= 4; width += 1) {
    for (let index = 0; index <= tokens.length - width; index += 1) {
      phrases.add(tokens.slice(index, index + width).join(" "));
    }
  }
  return { tokens: expandedTokens, phrases };
}

function containsFeature(query, feature) {
  return feature.includes(" ")
    ? query.phrases.has(feature)
    : query.tokens.has(feature);
}

function buildDocumentFrequency(candidates) {
  const frequency = new Map();
  for (const candidate of candidates) {
    for (const feature of candidate.features.keys()) {
      frequency.set(feature, (frequency.get(feature) ?? 0) + 1);
    }
  }
  return frequency;
}

function scoreCandidate(candidate, query, documentFrequency, candidateCount) {
  const matches = [];
  const evidenceTokens = new Set();
  let matchedPhrase = false;
  let score = 0;
  for (const feature of candidate.features.values()) {
    if (!containsFeature(query, feature.key)) continue;
    const frequency = documentFrequency.get(feature.key) ?? 1;
    const inverseFrequency = Math.log((candidateCount + 1) / (frequency + 1)) + 1;
    const contribution = feature.weight * inverseFrequency;
    score += contribution;
    matches.push({
      feature: feature.key,
      source: feature.source,
      contribution: Number(contribution.toFixed(3)),
    });
    if (feature.source !== "action") {
      const featureTokens = splitTokens(feature.key);
      if (featureTokens.length > 1) matchedPhrase = true;
      for (const token of featureTokens) {
        if (!ACTION_WORDS.has(token) && query.tokens.has(token)) {
          evidenceTokens.add(token);
        }
      }
    }
  }
  const promptEvidenceTokens = [...query.tokens].filter(
    (token) => !ACTION_WORDS.has(token),
  );
  const evidenceCoverage =
    promptEvidenceTokens.length === 0
      ? 0
      : evidenceTokens.size / promptEvidenceTokens.length;
  return {
    name: candidate.name,
    score: Number(score.toFixed(3)),
    evidenceTokenCount: evidenceTokens.size,
    evidenceTokens: [...evidenceTokens].sort(),
    evidenceCoverage: Number(evidenceCoverage.toFixed(3)),
    matchedPhrase,
    hasDistinctiveEvidence: [...evidenceTokens].some(
      (token) => !AMBIGUOUS_CONTEXT_TOKENS.has(token),
    ),
    matchedFeatures: matches.sort(
      (left, right) =>
        right.contribution - left.contribution ||
        left.feature.localeCompare(right.feature),
    ),
  };
}

export async function loadRoutingCatalog(root) {
  const registry = JSON.parse(
    await readFile(path.join(root, "registry", "skills.json"), "utf8"),
  );
  const entries = registry.skills.filter(
    (entry) =>
      entry.visibility === "public" &&
      entry.status === "canonical" &&
      entry.routing?.role === "primary",
  );

  return Promise.all(
    entries.map(async (entry) => {
      const markdown = await readFile(
        path.join(root, "skills", entry.name, "SKILL.md"),
        "utf8",
      );
      return buildCandidate(entry, parseDescription(markdown));
    }),
  );
}

export function routePrompt(
  catalog,
  prompt,
  {
    minimumScore = DEFAULT_MINIMUM_SCORE,
    minimumMatchedFeatures = DEFAULT_MINIMUM_MATCHED_FEATURES,
  } = {},
) {
  const query = expandPrompt(prompt);
  const documentFrequency = buildDocumentFrequency(catalog);
  const rankedCandidates = catalog
    .map((candidate) =>
      scoreCandidate(candidate, query, documentFrequency, catalog.length),
    )
    .filter((candidate) => candidate.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score || left.name.localeCompare(right.name),
    );
  const eligibleCandidates = rankedCandidates.filter(
    (candidate) =>
      candidate.score >= minimumScore &&
      (candidate.matchedPhrase ||
        (candidate.evidenceTokenCount >= minimumMatchedFeatures &&
          candidate.hasDistinctiveEvidence)),
  );
  const predicted = eligibleCandidates[0]?.name ?? null;

  return {
    predicted,
    rankedCandidates: rankedCandidates.slice(0, 3),
  };
}

export function evaluateRoutingBenchmark(catalog, fixture) {
  const cases = fixture.cases.map((entry) => {
    const routed = routePrompt(catalog, entry.prompt);
    const correct = routed.predicted === entry.expected;
    const expected = entry.expected ?? null;
    const predicted = routed.predicted ?? null;
    return {
      id: entry.id,
      category: entry.category,
      prompt: entry.prompt,
      expected,
      predicted,
      correct,
      confusion: `expected ${expected ?? "abstain"}, predicted ${predicted ?? "abstain"}`,
      rankedCandidates: routed.rankedCandidates,
    };
  });
  const correct = cases.filter((entry) => entry.correct).length;
  const total = cases.length;
  const accuracy = total === 0 ? 0 : correct / total;
  const minimumAccuracy = fixture.minimumAccuracy;

  return {
    schemaVersion: 1,
    method: "deterministic-catalog-metadata-qa",
    scope:
      "Lexical discoverability of public canonical primary routes from checked-in registry metadata and SKILL.md descriptions. This is not Memi runtime routing.",
    total,
    correct,
    incorrect: total - correct,
    accuracy,
    minimumAccuracy,
    passed: accuracy >= minimumAccuracy,
    summary: `${correct}/${total} correct (${(accuracy * 100).toFixed(1)}%); required ${(minimumAccuracy * 100).toFixed(1)}%`,
    cases,
  };
}

async function runCli() {
  const root = path.resolve(import.meta.dirname, "..");
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
      console.log(`- ${result.id}: ${result.confusion}; candidates: ${candidates || "none"}`);
    }
  }
  if (!report.passed) process.exitCode = 1;
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) await runCli();
