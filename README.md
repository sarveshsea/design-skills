# Design Skills

[![CI](https://github.com/sarveshsea/design-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/sarveshsea/design-skills/actions/workflows/ci.yml)
[![Agent Skills](https://skills.sh/b/sarveshsea/design-skills)](https://skills.sh/sarveshsea/design-skills)
[![License: MIT](https://img.shields.io/badge/license-MIT-111827.svg)](LICENSE)

Design Skills is a curated library of product-design workflows for AI coding agents. It combines portable design judgment with clearly labeled integration workflows for Figma, Mémoire, research tools, code generation, motion, and agent operations.

The repository keeps three sources of truth:

- `skills/<name>/SKILL.md` contains the workflow an agent reads.
- `registry/` contains routing, lifecycle, capability, collection, maturity, and compatibility metadata.
- `provenance.json` contains authorship, immutable revisions, license evidence, and quarantine decisions.

`note.json` manifests and `catalog.json` are deterministic generated projections. Do not edit them directly.

## Install safely

Inspect the available skills before installing:

```bash
npx skills@1.5.17 add sarveshsea/design-skills --list
```

Install only the workflow you need:

```bash
npx skills@1.5.17 add sarveshsea/design-skills --skill better-ui
npx skills@1.5.17 add sarveshsea/design-skills --skill accessibility-audit
```

Installing the repository without `--skill` may offer or install the entire discoverable corpus, including integration-specific and internal compatibility payloads. Review [`catalog.json`](catalog.json) first. The upstream Skills CLI does not currently implement this repository's collection manifests as an installation primitive.

Mémoire can consume the same folders as Notes:

```bash
memi notes install better-ui --catalog https://www.memoire.cv/notes/community/catalog.v1.json
```

## Portability

- **Portable:** usable from supplied files, screenshots, or text without a proprietary runtime.
- **Capability-gated:** requires a declared integration such as Figma, Docker, Linear, Notion, Remotion, or Hyperframes.
- **Mémoire-only:** depends on the Mémoire engine or MCP surface.
- **Quarantined:** blocked from public collections and routing when redistribution or safety evidence is unresolved.

Discoverability does not imply that a client has every required tool. Check each catalog entry's `runtime.requires`, fallback, visibility, maturity, and status before use.

## Collections

Collections are curated navigation and policy manifests under `registry/collections/`. They do not duplicate skill payloads.

<!-- GENERATED:COLLECTIONS:START -->
| Collection | Skills | Availability | Purpose |
| --- | ---: | --- | --- |
| `core` | 15 | Recommended core | Recommended portable, stable design judgment for most product work. |
| `design-systems` | 5 | Optional | Tokens, components, governance, and system architecture. |
| `figma` | 15 | Optional | Capability-gated Figma workflows. |
| `implementation` | 7 | Optional | Framework and design-to-code generation workflows. |
| `memoire-operations` | 19 | Internal/optional | Mémoire-specific and agent-runtime operations. |
| `motion-video` | 10 | Optional | Interaction motion, animation review, and product video workflows. |
| `product-design` | 49 | Optional | Interface craft, product thinking, and design validation workflows. |
| `research` | 9 | Optional | Evidence collection, synthesis, and evaluative research workflows. |
<!-- GENERATED:COLLECTIONS:END -->

The default `core` collection is intentionally limited to public, stable, canonical, portable skills. Figma and Mémoire workflows live in capability-specific collections.

## Compatibility migrations

Renamed or consolidated slugs remain self-contained for one compatibility release. They do not own primary routing intents or appear in collections.

| Historical slug | Canonical workflow |
| --- | --- |
| `browser-research-agent` | `web-research` |
| `memoire-mcp-agent-skills` | `memoire-design-tooling` |
| `design-sandbox-proof` | `memoire-design-tooling` |
| `memoire-studio-macos` | `memoire-design-tooling` |
| `memoire-v2-surface-map` | `memoire-design-tooling` |
| `figma-library-builder` | `figma-generate-library` |

Explicit installation of a historical slug continues to work during the compatibility window. New documentation and collections use only canonical names.

## Choosing a workflow

| Goal | Start with |
| --- | --- |
| Improve an interface broadly | [`better-ui`](skills/better-ui/SKILL.md) |
| Fix color or contrast | [`better-colors`](skills/better-colors/SKILL.md) |
| Improve typography | [`better-typography`](skills/better-typography/SKILL.md) |
| Audit accessibility | [`accessibility-audit`](skills/accessibility-audit/SKILL.md) |
| Review a bounded animation change | [`review-animations`](skills/review-animations/SKILL.md) |
| Plan motion improvements | [`improve-animations`](skills/improve-animations/SKILL.md) |
| Synthesize research | [`data-synthesis`](skills/data-synthesis/SKILL.md) |
| Work through Mémoire | [`memoire-design-tooling`](skills/memoire-design-tooling/SKILL.md) |

## Provenance and trust

Adapted material records its author, source repository, exact commit, license, and relationship in [`provenance.json`](provenance.json). The current attributed sources are:

- Mémoire by Sarvesh Chidambaram
- Jakub Krehel's MIT-licensed design skills
- Emil Kowalski's MIT-licensed design-engineering skills
- Josh Puckett's MIT-licensed DialKit repository

Seven Figma integration entries are original link-only routers because the official MCP guide points to Figma Developer Terms without a standalone redistribution license. This repository does not include the upstream workflow prose, reference bundle, or scripts. See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

Interface Craft is a paid Josh Puckett product without a public redistribution license. This repository does not copy its member curriculum.

Stars and install counts are discovery signals, not security guarantees. Review a skill before granting an agent access to sensitive files, external services, or write-capable tools.

## Repository structure

```text
skills/<skill>/
├── SKILL.md       # Standard Agent Skills entrypoint
├── note.json      # Generated Mémoire compatibility manifest
└── references/    # Progressive-disclosure material

registry/skills.json          # Canonical behavioral metadata
registry/collections/*.json   # Curated profiles
provenance.json               # Canonical legal/source record
catalog.json                  # Generated public catalog
scripts/                      # Generation and validation
tests/                        # Contract and regression tests
```

## Contribute

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request. Every contribution needs a bounded job, explicit use and non-use conditions, concrete outputs, verification, capability requirements, collection placement, and defensible provenance.

Run the complete proof loop:

```bash
npm ci
npm run check
npx skills@1.5.17 add . --list
```

Report security issues through [`SECURITY.md`](SECURITY.md), not a public issue.
