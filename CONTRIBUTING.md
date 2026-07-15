# Contributing

Design Skills accepts focused, source-backed skills that improve an agent's design judgment or design workflow.

## Before writing

1. Search [`registry/skills.json`](registry/skills.json) and [`catalog.json`](catalog.json) for overlap.
2. Define one bounded job and concrete triggering phrases.
3. Decide whether the work is original, adapted under a compatible license, or only inspired by public facts.
4. Open an issue before importing or substantially adapting another author's work.

## Skill contract

Create `skills/<kebab-case-name>/SKILL.md` with exactly two frontmatter fields:

```yaml
---
name: review-layout
description: Review layout when an interface needs clearer hierarchy, spacing, density, or responsive behavior.
---
```

Keep the entrypoint under 500 lines. Put detailed tables, examples, and variant-specific guidance in `references/`. Link every reference directly from `SKILL.md` and avoid deep reference chains.

Write imperative, evidence-oriented instructions. Include scope boundaries, failure modes, verification, and the expected output when those details materially improve execution.

Add one entry to [`registry/skills.json`](registry/skills.json). Declare:

- one bounded primary routing intent;
- lifecycle, domain, action, and surface facets;
- workflow, adapter, reference, router, or internal-runbook type;
- portability and every required capability;
- maturity, visibility, and release status;
- dependencies, related skills, legacy Note metadata, and collection membership.

Update the corresponding file under [`registry/collections/`](registry/collections/) in the same change. The `core` collection accepts only public, stable, canonical, portable skills.

## Provenance

- Original work must identify its author and source repository.
- Adapted work must have an explicit redistribution license.
- Pin the exact upstream commit and preserve the required copyright and license text.
- Describe the relationship honestly: first-party, adapted, or original workflow based on upstream documentation.
- Public availability is not a license. Do not copy paid, gated, or unlicensed material.

Update [`provenance.json`](provenance.json) before running the catalog sync. If redistribution rights are unknown, record the evidence, mark the skill quarantined, and exclude it from public collections.

## Validate

```bash
npm run sync
npm run check
npx skills@1.5.17 add . --list
```

The pull request should explain the user need, sources, licensing, structural changes, and verification performed.
