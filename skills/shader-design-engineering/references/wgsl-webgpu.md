# WebGPU and WGSL

Use this reference when a browser effect requires WebGPU or when designing a future WebGPU adapter.

## Contract

- Treat WebGPU availability as a capability check, not an assumption. Keep a WebGL2 or static fallback unless the product explicitly requires WebGPU.
- Request only necessary device features and limits. Validate required limits before creating resources.
- Keep bind-group layouts, resource lifetimes, texture formats, and color-space assumptions explicit.
- Use WGSL validation and compilation information as actionable diagnostics. Label messages with the module and entry point.
- Handle device loss as a state transition with a bounded recovery or fallback, not an infinite recreate loop.
- Keep optional language features behind capability checks and record them in the effect contract.

## Determinism and portability

- Supply seed, clock, resolution, and interaction inputs from the host.
- Avoid depending on unspecified floating-point edge behavior for visual identity.
- Validate buffer alignment and texture format rules against the current specification.
- Keep the effect's portable core separate from adapter-specific resource code.

## Evidence

- Record browser, adapter information exposed for diagnostics, requested features, limits, and target resolution without using them for fingerprinting.
- Capture validation errors, compilation information, device loss, reduced motion, fallback selection, and deterministic reference frames.
- Profile render passes and texture traffic on representative hardware.

## Sources

- [W3C: WebGPU Shading Language](https://www.w3.org/TR/WGSL/)
- [W3C: WebGPU](https://www.w3.org/TR/webgpu/)
- [MDN: WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)
- [Khronos 2026 Shader Ecosystem Survey](https://www.khronos.org/blog/shader-ecosystem-survey-results-2026)
