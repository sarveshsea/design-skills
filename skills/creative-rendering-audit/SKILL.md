---
name: creative-rendering-audit
description: Audit shaders, GPU-driven effects, dithering, particles, and creative rendering for visual intent, correctness, performance, accessibility, fallbacks, evidence quality, and source licensing.
---

# Creative Rendering Audit

Audit the supplied implementation and rendered behavior. Keep the audit read-only unless the user separately authorizes fixes.

## Workflow

1. Establish the intended visual behavior, target platforms, supported hardware, quality tiers, fallback, and user-facing acceptance criteria.
2. Map the rendering path from host inputs to shader stages, textures, render targets, compositing, and final presentation.
3. Gather evidence:
   - Read shader and host-language source with file and line anchors.
   - Capture compilation, validation, and device-loss messages.
   - Exercise deterministic frames with a fixed seed and clock.
   - Compare the full effect, reduced-motion path, unsupported-renderer path, and static fallback.
   - Profile realistic content at the stated resolution on named hardware.
4. Review every dimension in [references/audit-rubric.md](references/audit-rubric.md).
5. Use [references/platform-evidence.md](references/platform-evidence.md) for surface-specific evidence and failure modes.
6. Reproduce or directly observe every high-severity finding. Mark code-only inferences as hypotheses.
7. Report missing evidence as unassessed. Do not award a pass for a dimension that could not be tested.

## Scoring

Score only verified evidence.

| Dimension | Points |
| --- | ---: |
| Visual intent and interaction fit | 15 |
| Coordinate, sampling, color, and alpha correctness | 20 |
| Dither and temporal stability | 15 |
| Performance and resource bounds | 20 |
| Accessibility, fallback, and failure behavior | 20 |
| Provenance, licensing, and reproducible evidence | 10 |

Apply these caps:

- Missing or incompatible source or asset license: maximum 49.
- No accessible or unsupported-renderer fallback: maximum 69.
- No rendered runtime evidence: maximum 79.
- No named-device performance evidence for an animated effect: maximum 89.

Include a confidence value derived from assessed points divided by 100. Unknown dimensions score zero and lower confidence.

## Required output

Start with a findings table ordered by severity:

| Severity | Evidence | Finding | User impact | Required correction |
| --- | --- | --- | --- | --- |

Use `critical`, `high`, `medium`, or `low`. Cite `file:line` and attach runtime evidence when available.

Then provide:

- score, confidence, assessed dimensions, and applied caps;
- platform, device, resolution, seed, clock, and quality tier;
- checks that passed with evidence;
- unassessed behavior and the exact evidence needed;
- a verdict of `Block`, `Conditional pass`, or `Pass`.

## Verdict rules

- **Block** for unsafe or incompatible licensing, inaccessible essential content, persistent rendering failure, unbounded sampling, or a reproducible severe performance regression.
- **Conditional pass** when the bounded effect works but platform, accessibility, or named-device evidence is incomplete.
- **Pass** only when all required dimensions have verified evidence and no critical or high finding remains.

## Boundaries

- Do not treat a deterministic fixture as live integration proof.
- Do not infer visual quality from a successful build.
- Do not hide performance variance behind an average alone; include worst observed behavior or a percentile where tooling permits.
- Do not recommend copying restricted reference implementations.

## Maintenance

Review platform evidence and reference links at least every 180 days. Refresh the registry and provenance verification dates only after inspection, then run the repository validator.
