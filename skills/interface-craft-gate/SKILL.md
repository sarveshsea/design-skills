---
name: interface-craft-gate
description: Make interface craft a required design-agent gate before and after UI changes.
---

# Interface Craft Gate

Use this Note when UI work needs design craft, not only functional correctness.

## Required local evidence

```bash
memi agent brief . --intent "Improve this interface" --json
memi diagnose .
memi ux audit . --json
memi craft audit . --json
memi tokens --from ./src --report
```

If a running route or screenshot is available, audit that surface too:

```bash
memi diagnose http://localhost:3000
memi ux audit http://localhost:3000 --json
memi craft audit http://localhost:3000 --json
```

## Craft dimensions

Review these before patching:

- focusing mechanism: what the user sees and does first
- visual weight: contrast, density, and priority
- typographic hierarchy: type scale, weight, line length, and scan order
- spacing rhythm: repeated layout gaps and component padding
- color intentionality: semantic color use, states, and token fit
- component cohesion: variants, radius, strokes, icons, and shared anatomy
- responsive resilience: breakpoints, overflow, touch context, and long content
- user context care: stakes, confidence, recovery, and time pressure

## Patch rule

Do not describe a UI as polished unless the handoff names:

1. the evidence commands run,
2. the craft dimensions that changed,
3. the Atomic Design level touched,
4. the shadcn/Tailwind primitives reused,
5. the verification command that should run next.

## Sources

- https://github.com/memi-design/memi
- https://www.npmjs.com/package/@memi-design/cli
- https://github.com/memi-design/design-sandbox
