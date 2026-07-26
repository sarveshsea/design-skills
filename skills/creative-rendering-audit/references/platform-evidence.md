# Platform Evidence

## WebGL2 and GLSL ES

- Capture shader compile and program link logs.
- Verify drawing-buffer sizing, viewport, device-pixel ratio, context loss, and fallback.
- Inspect texture completeness, filters, wrapping, coordinate conversion, and browser compositing.
- Profile with browser performance and GPU tooling where available.

Sources: [WebGL2RenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext), [WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices).

## WebGPU and WGSL

- Capture WGSL validation and compilation information.
- Record requested features and limits, bind-group and texture formats, device loss, and fallback selection.
- Verify optional language features and cross-browser availability before treating the path as portable.

Sources: [WGSL](https://www.w3.org/TR/WGSL/), [WebGPU](https://www.w3.org/TR/webgpu/).

## SwiftUI and Metal

- Identify `colorEffect`, `distortionEffect`, `layerEffect`, or a custom render path.
- Verify stitchable signatures, argument order, user-space positions, premultiplied output, and `maxSampleOffset`.
- Capture the effect and fallback in a simulator; require a physical device when thermal, GPU timing, or touch behavior affects acceptance.

Sources: [SwiftUI Shader](https://developer.apple.com/documentation/swiftui/shader), [Metal tools](https://developer.apple.com/metal/tools/).

## Cross-platform findings

Do not translate code line-for-line between shading languages. Compare the rendering contract:

- coordinate and texture origin;
- clip and depth conventions;
- matrix layout and multiplication order;
- available precision and numeric edge behavior;
- binding and resource lifetime model;
- color, alpha, and presentation path;
- debugging and performance evidence.

The [Khronos 2026 Shader Ecosystem Survey](https://www.khronos.org/blog/shader-ecosystem-survey-results-2026) identifies debugging, profiling, and cross-platform porting as current ecosystem pain points. Treat those as verification work, not assumed equivalence.
