# Dithering

Dither to trade coherent quantization bands for controlled spatial or temporal variation. Start by identifying the actual artifact and output precision; do not add noise to an image that is already limited by compression, scaling, or an incorrect color transform.

## Technique selection

| Technique | Prefer when | Watch for |
| --- | --- | --- |
| Ordered threshold pattern | Determinism, low cost, pixel-art character, or stable screenshots matter | Repeating structure, moiré under scaling, coordinate instability |
| Seeded spatial noise | Repetition must be less visible and a texture or compact hash is acceptable | Grain clumping, unstable hashes, cross-platform differences |
| Blue-noise-shaped input | Low-frequency structure is especially objectionable and a licensed source texture is available | Asset provenance, tiling, sampling cost |
| Temporal variation | The display pipeline and motion make frame-varying error beneficial | Shimmer, seizure risk, screenshots, recording artifacts |

## Implementation contract

- Apply thresholds in a documented working space and verify the displayed result. Dithering encoded values and dithering linear-light values are not interchangeable.
- Scale the dither amplitude to the target quantization step. Larger noise changes the image rather than hiding a band.
- Derive ordered-pattern coordinates from stable output pixels. Decide whether the pattern should remain screen-locked or content-locked during motion.
- Accept an explicit seed for stochastic methods. Keep test and export seeds fixed.
- Preserve alpha semantics. Avoid introducing colored or opaque fringes around transparent content.
- Clamp only at the intended output boundary; premature clamping can reintroduce bands.
- Compare against a no-dither baseline and inspect gradients, flat fields, dark tones, transparency, scaling, and animated movement.

## Accessibility

- Disable or freeze temporal dither under reduced motion when variation is perceptible.
- Avoid large-amplitude or high-contrast temporal noise.
- Preserve legibility and contrast; dither is not a substitute for accessible color choices.
- Provide a static fallback for capture, printing, low-power, and unsupported rendering paths.

## Provenance

Ordered threshold mathematics and noise-shaping concepts may be implemented independently. Do not copy source from The Book of Shaders or LYGIA into a commercial or redistributed skill. Link to those projects for study and follow their current license terms.

## Sources

- [The Book of Shaders](https://thebookofshaders.com/) — link-only learning reference
- [LYGIA](https://github.com/patriciogonzalezvivo/lygia) — link-only unless the applicable license grants the intended use
- [Apple: Shader](https://developer.apple.com/documentation/swiftui/shader)
- [W3C: WebGPU Shading Language](https://www.w3.org/TR/WGSL/)
