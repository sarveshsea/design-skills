# Catalog Routing Benchmark

## Purpose

This benchmark tests whether a representative user prompt can find the intended
public, canonical, primary skill from the catalog's checked-in metadata. It is a
catalog QA gate. It does not execute or approximate Mémoire's runtime routing,
an LLM classifier, embeddings, tool availability, multi-skill composition, or a
real agent conversation.

The CI requirement is 100% top-1 accuracy for this checked-in set. An expected
`null` result means the evaluator must abstain.

The current checked-in fixture scores **52/52 (100%)**. It includes concise
implementation and audit prompts plus negative controls that share shader-adjacent
words. Any future confusion is printed by the command and fails the gate rather
than being hidden through a fixture exception.

## Inputs

- `registry/skills.json`: public/canonical status, primary routing intents,
  display names, tags, actions, domains, and surfaces.
- `skills/<slug>/SKILL.md`: the frontmatter description only.
- `tests/fixtures/routing-prompts.json`: checked-in expected routes.

The fixture covers:

- shader, dither, and GPU implementation;
- creative-rendering audits;
- SwiftUI and Liquid Glass;
- motion, animation, and color;
- accessibility, typography, design systems, Figma, mobile, content,
  information architecture, interaction design, research, competition, and
  product framing;
- out-of-domain near-misses involving database, authentication, books,
  construction materials, legal motion, and printer color.

## Deterministic method

`scripts/evaluate-routing.mjs` normalizes prompt and metadata tokens, applies a
small documented set of spelling and action aliases, and builds weighted
features from:

1. routing intent;
2. skill name and display name;
3. tags;
4. the skill description;
5. action, domain, and surface facets;
6. validated action-aware exclusions between overlapping primary routes.

Matches receive an inverse-catalog-frequency weight so rarer terms contribute
more than generic terms. Multi-token phrases are stronger than isolated words.
The evaluator abstains unless the leading eligible route reaches the minimum
score and has either a matched phrase or at least two evidence tokens including
one non-ambiguous context term. Prompts with multiple explicit out-of-domain
signals abstain even when they contain an isolated shader-adjacent term.

Results include numerator, denominator, accuracy, the required threshold, every
case's expected and predicted route, its top three scored candidates, matching
features, and a plain-language confusion string.

Run the human-readable gate:

```bash
npm run check:routing
```

Generate the complete machine-readable evidence:

```bash
node scripts/evaluate-routing-cli.mjs --json
```

## Limitations

- The fixture is curated and versioned with the catalog. It is not traffic data
  and makes no claim about external prompt frequency.
- Lexical matching cannot fully resolve intent when implementation and audit
  skills share terms such as shader, fallback, performance, and reduced motion.
  Confusions remain visible in output and should inform clearer descriptions or
  new fixture coverage.
- Accuracy is top-1 for one expected owner. Some real requests should compose
  multiple skills.
- The score does not test whether a skill executes correctly, whether a runtime
  has required capabilities, or whether a fallback is useful.
- Changes to fixtures, weights, aliases, or abstention rules require review.
  Do not weaken cases merely to raise the percentage.

CI runs this benchmark through the default `npm run check` command. Any result
below 100% fails the job.
