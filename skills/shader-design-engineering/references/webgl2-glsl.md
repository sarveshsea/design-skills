# WebGL2 and GLSL ES

Use this reference for browser effects implemented with a WebGL2 rendering context and GLSL ES 3.00 shaders.

## Contract

- Request WebGL2 explicitly and supply a readable static or DOM fallback when context creation fails.
- Size the drawing buffer from CSS size and a bounded device-pixel ratio. Update the viewport and resolution uniform together.
- Name coordinate spaces in host code and shaders. Convert pointer input from CSS pixels through the drawing buffer before deriving UV coordinates.
- Declare shader precision and bind uniforms by explicit names and types.
- Compile and link once per program variant. Surface shader logs with the stage and source label; never reduce a failed link to a blank canvas.
- Restore or rebuild resources after context loss. Stop animation work while the context is unavailable.

## Color and sampling

- Document whether sampled textures are encoded or linear and where conversion occurs.
- Keep alpha semantics explicit. Browser compositing commonly expects premultiplied behavior, while texture data and shader math may not.
- Define wrap and filter modes rather than relying on defaults.
- Bound every neighbor sample and clamp or deliberately wrap coordinates at edges.
- Add dither after tone mapping or gradient construction and before the final low-bit-depth presentation step.

## Evidence

- Capture compilation and link logs for both a passing program and a deliberately invalid fixture.
- Capture deterministic frames at 1x and the maximum supported device-pixel ratio.
- Exercise resize, tab visibility changes, context loss where test tooling permits, reduced motion, and fallback rendering.
- Profile the same resolution and content used by the product flow.

## Sources

- [MDN: WebGL2RenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext)
- [MDN: WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
- [Khronos: OpenGL ES Shading Language](https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf)
- [Khronos 2026 Shader Ecosystem Survey](https://www.khronos.org/blog/shader-ecosystem-survey-results-2026)
