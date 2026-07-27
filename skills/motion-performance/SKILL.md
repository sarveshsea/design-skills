---
name: motion-performance
description: Motion performance pack for 60fps UI animation, reduced-motion fallbacks, render budget checks, and video export QA.
---

# Motion Performance

Use this Note to keep UI motion and generated video projects fast, accessible,
and renderable.

## Checks

- Animate transform and opacity first; treat layout and paint-heavy properties
  as exceptions that need proof.
- Route shader, dither, particle, and custom GPU effects to
  `shader-design-engineering`; use `creative-rendering-audit` for named-device
  profiling, fallback verification, and a scored rendering verdict.
- Define fixed dimensions, fps, and duration for video projects before render.
- Keep text within safe crop zones for 16:9, 9:16, and square variants.
- Add reduced-motion alternatives for UI surfaces that embed generated motion.
- Validate exported artifacts for existence, size, and playable MIME type before
  surfacing a download.

## Backend Rules

- Render concurrency should default to one job per Studio runtime.
- Download and render queues need explicit failed states and retry-safe records.
- Use checksums for downloaded Note archives and never run scripts while
  installing a Note.
