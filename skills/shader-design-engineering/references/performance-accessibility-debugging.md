# Performance, Accessibility, and Debugging

## Frame budget

Set the product budget before optimizing. A 60 Hz display offers about 16.7 ms for the entire frame, not for the shader alone. Preserve time for layout, input, compositing, other render passes, and variance.

Record:

- named hardware, OS, browser or app build;
- viewport and drawing-buffer resolution;
- frame cadence and quality tier;
- median plus a tail measure or worst observed frame;
- GPU and CPU evidence when tooling exposes both;
- warm-up, capture duration, and content used.

Reduce cost in this order when visual intent permits:

1. Remove unnecessary passes and samples.
2. Bound resolution and device-pixel ratio.
3. Reduce sample radius or quality tier.
4. Move invariant work to the host or precomputed resources.
5. Reduce precision only after checking visible and numerical behavior.

## Accessibility

- Preserve semantic controls and content outside the shader.
- Honor reduced motion by freezing time, reducing displacement, or selecting the fallback according to the effect's purpose.
- Honor reduced transparency when translucent or refractive effects obscure content.
- Maintain contrast and focus indicators in every quality tier.
- Avoid rapid luminance changes and large, high-contrast temporal noise.
- Test keyboard, pointer, touch, screen reader, zoom, and capture behavior when the effect touches those surfaces.

## Debugging ladder

1. Confirm the fallback and host layout render without the shader.
2. Surface compile, link, validation, and device-loss messages.
3. Replace output with constant diagnostic colors.
4. Visualize UVs, sample coordinates, alpha, and intermediate scalar ranges.
5. Freeze time and seed.
6. Disable textures and passes one at a time.
7. Capture a GPU frame or browser trace on the failing device.
8. Reduce to the smallest reproducible shader and host state.

Report the first failing boundary. A successful compilation proves syntax and binding compatibility, not visual correctness or frame performance.

## Sources

- [MDN: WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
- [Apple: Metal tools and debugging](https://developer.apple.com/metal/tools/)
- [Khronos 2026 Shader Ecosystem Survey](https://www.khronos.org/blog/shader-ecosystem-survey-results-2026)
