---
name: shader-design-engineering
description: Design, implement, and verify intentional real-time shader effects for WebGL2, WebGPU/WGSL, and SwiftUI/Metal, including dithering, color correctness, accessible fallbacks, profiling, and debugging.
---

# Shader Design Engineering

Build a shader only when it clarifies state, supports a visual system, communicates spatial change, or creates bounded delight. Treat the shader as product behavior with a fallback, not as decoration that can obscure content.

## Workflow

1. Inspect the rendering surface, deployment targets, existing renderer, asset licenses, design tokens, accessibility settings, and performance tooling.
2. Write an effect contract: visual purpose, input and coordinate spaces, uniforms, textures, output color and alpha semantics, animation clock, quality tiers, fallback, and acceptance evidence.
3. Choose the smallest compatible effect:
   - Use a color effect when output depends only on the current pixel.
   - Use a distortion effect when the shader changes sample coordinates.
   - Use a layer or texture effect only when neighboring samples are necessary.
   - Use a separate render pass only when the effect cannot fit the host framework's bounded effect API.
4. Normalize coordinates explicitly. Keep pixel, normalized device, UV, view, and texture spaces named rather than relying on implicit conversions.
5. Keep time and randomness controllable. Accept a clock and seed from the host so tests, reduced motion, screenshots, and replays remain deterministic.
6. Perform lighting and interpolation in a documented working color space. Preserve premultiplied alpha when the host requires it, and convert only at known boundaries.
7. Add dithering after the intended tone or color mapping and before final quantization. Match the technique to the artifact: ordered patterns for deterministic low-cost output, noise-shaped methods when visible structure is unacceptable.
8. Provide reduced-motion, reduced-transparency, low-power, unsupported-platform, and renderer-failure behavior before polishing the full effect.
9. Profile the target interaction with realistic content. Record frame time, GPU work, resolution, device, browser or OS, and quality tier.
10. Verify the effect visually and structurally. Capture deterministic frames, inspect compilation and validation messages, exercise the fallback, and report any untested platform honestly.

## Platform routing

Read only the reference needed for the selected surface:

| Surface | Reference |
| --- | --- |
| WebGL2 and GLSL ES | [references/webgl2-glsl.md](references/webgl2-glsl.md) |
| WebGPU and WGSL | [references/wgsl-webgpu.md](references/wgsl-webgpu.md) |
| SwiftUI and Metal | [references/swiftui-metal.md](references/swiftui-metal.md) |
| Ordered, noise-based, or temporal dithering | [references/dithering.md](references/dithering.md) |
| Profiling, accessibility, and debugging | [references/performance-accessibility-debugging.md](references/performance-accessibility-debugging.md) |

Use `creative-rendering-audit` when the requested outcome is an evidence-backed review rather than implementation.

## Required handoff

Report:

- effect purpose and non-goals;
- platform, effect type, coordinate and color-space contract;
- uniforms, textures, seed, clock, and quality tiers;
- fallback and accessibility behavior;
- source and asset provenance;
- verification commands, rendered evidence, device, resolution, and measured frame budget;
- compilation, runtime, or cross-platform checks that remain unverified.

## Boundaries

- Do not copy shader source, diagrams, or prose from link-only or restrictively licensed references.
- Do not claim a visual match from static code inspection.
- Do not hide content, focus, selection, or error state behind an effect.
- Do not introduce uncontrolled time, device-dependent random state, or an unbounded sampling radius.
- Do not ship a high-quality path without a behaviorally meaningful fallback.

## Maintenance

Review platform and reference links at least every 180 days. Refresh `lastResearchedAt`, source URLs, and immutable reference revisions only after checking the referenced material. Run the repository validator; it flags malformed URLs and shader references that exceed the freshness window.
