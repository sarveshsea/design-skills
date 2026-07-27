# SwiftUI and Metal

Use this reference for SwiftUI shader effects backed by Metal shading functions.

## Choose the effect

- Use `colorEffect` when each output pixel depends on its current color and uniforms.
- Use `distortionEffect` when the effect changes the source position.
- Use `layerEffect` only when neighboring samples from the rendered layer are required.
- Use a custom Metal render path only when the SwiftUI effect APIs cannot express the required rendering contract.

## Contract

- Match the documented `[[ stitchable ]]` function signature for the selected effect.
- Bind arguments in the same order and type expected by the shader function.
- Treat the supplied position as user-space coordinates and normalize with an explicit size argument when UV coordinates are needed.
- Return premultiplied color in the destination color space expected by SwiftUI.
- Set `maxSampleOffset` from the largest possible displacement or neighborhood radius. Do not use an arbitrary unbounded value.
- Gate effect APIs by deployment target and supply an equivalent static or native SwiftUI fallback.
- Precompile a shader usage when the supported SDK exposes that facility and first-use latency is material.
- Enable or implement dithering deliberately for smooth gradients; avoid applying two independent dither stages.

## Accessibility and evidence

- Read Reduce Motion and Reduce Transparency at the host layer. Freeze time, reduce displacement, or select the static fallback based on the effect's purpose.
- Keep labels, focus, hit testing, selection, and semantic state in SwiftUI rather than encoding meaning only in pixels.
- Capture the shader-enabled path and fallback in a simulator. Use a physical device when GPU timing, thermal behavior, or touch response affects acceptance.
- Record Xcode, SDK, simulator or device, OS, resolution, seed, clock, and measured frame behavior.

## Sources

- [Apple: Shader](https://developer.apple.com/documentation/swiftui/shader)
- [Apple: colorEffect](https://developer.apple.com/documentation/swiftui/view/coloreffect(_:isenabled:))
- [Apple: distortionEffect](https://developer.apple.com/documentation/swiftui/view/distortioneffect(_:maxsampleoffset:isenabled:))
- [Apple: layerEffect](https://developer.apple.com/documentation/swiftui/view/layereffect(_:maxsampleoffset:isenabled:))
- [Apple: Metal tools and debugging](https://developer.apple.com/metal/tools/)
