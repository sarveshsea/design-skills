# Creative Rendering Audit Rubric

## 1. Visual intent and interaction fit — 15

- Name the user-facing purpose and frequency.
- Verify that motion, distortion, particles, or noise do not delay a frequent action or obscure essential content.
- Compare the result with the product's visual language and the documented fallback.

## 2. Rendering correctness — 20

- Trace coordinate conversions across CSS, pixels, UVs, view space, and textures.
- Verify sampling bounds, texture filtering and wrap modes, uniforms, time, and resolution.
- Verify working and output color spaces, transfer functions, gamut behavior, and premultiplied alpha.
- Inspect resize, edge pixels, transparency, high pixel density, and representative assets.

## 3. Dither and temporal stability — 15

- Identify output precision and the artifact the dither is intended to correct.
- Verify amplitude, pattern coordinates, seed, clock, and placement in the color pipeline.
- Inspect gradients, flat fields, dark tones, scaling, movement, capture, and reduced motion.
- Flag shimmer, crawling patterns, moiré, color bias, and alpha fringes.

## 4. Performance and resource bounds — 20

- Record named hardware, resolution, frame cadence, warm-up, capture length, and quality tier.
- Bound sample radius, passes, textures, allocations, device-pixel ratio, and recovery loops.
- Inspect CPU and GPU evidence where supported.
- Compare median and tail behavior against the whole-frame product budget.

## 5. Accessibility, fallback, and failure behavior — 20

- Verify reduced motion, reduced transparency, contrast, focus, input, zoom, and semantic content.
- Force unsupported-renderer, compilation, context-loss or device-loss, and low-quality paths where tooling permits.
- Require a readable, behaviorally meaningful fallback.

## 6. Provenance and reproducibility — 10

- Trace shader source, algorithms, textures, images, and sample assets to compatible licenses.
- Record seed, clock, inputs, build, platform, device, and commands.
- Distinguish static analysis, deterministic fixtures, simulator evidence, and live device evidence.
