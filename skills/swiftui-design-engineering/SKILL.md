---
name: swiftui-design-engineering
description: Design, build, refactor, and review production SwiftUI interfaces with explicit state ownership, navigation, accessibility, design tokens, previews, and simulator verification.
---

# SwiftUI Design Engineering

Use this workflow when the deliverable is SwiftUI source, an iOS screen specification, or a review of an existing Apple-platform interface.

## Workflow

1. Inspect the project before choosing APIs: deployment targets, Swift language mode, nearby views, navigation ownership, dependency injection, test targets, and asset/token conventions.
2. Write the screen contract first: user goal, states, navigation, data ownership, platform availability, Dynamic Type behavior, VoiceOver order, reduced-motion behavior, and acceptance checks.
3. Reuse local components and semantic assets. Do not invent parallel button, card, spacing, color, or typography systems.
4. Keep state at the narrowest owner. Prefer value state for local UI, explicit inputs for feature dependencies, and environment injection only for genuinely shared services.
5. Compose small views around stable identities. Keep networking, persistence, formatting, and routing out of expensive `body` paths.
6. Add previews or fixtures for loading, empty, populated, error, large text, dark appearance, and right-to-left layout when relevant.
7. Build and test the smallest target, then run the critical simulator flow. Record commands and outcomes in the handoff.

## Design contract

- Use semantic system colors and asset catalog names, not raw repeated literals.
- Treat Dynamic Type, safe areas, keyboard avoidance, localization, and orientation as layout inputs.
- Use native controls before custom gestures. Preserve standard navigation, focus, selection, and dismissal behavior.
- Give every interactive control an accessible name and at least a 44 by 44 point practical hit region.
- Gate newer APIs with explicit availability and a behaviorally equivalent fallback.
- Do not claim a preview, build, test, or simulator flow passed unless it ran.

## Load on demand

Read [references/verification.md](references/verification.md) for the state matrix, source organization, and verification receipt.

Route custom `Shader`, `colorEffect`, `distortionEffect`, `layerEffect`, Metal, dithering, or GPU-effect work through `shader-design-engineering`. Use `creative-rendering-audit` when the outcome is a scored, evidence-backed rendering review.

For implementation details, use Apple's current documentation. In Codex, also use OpenAI's `build-ios-apps` skills when installed.
