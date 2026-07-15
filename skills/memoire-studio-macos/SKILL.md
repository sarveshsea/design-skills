---
name: memoire-studio-macos
description: Connect the Tauri/Rust macOS Studio app to the CLI, MCP, receipts, and project artifacts.
---

# Memoire Studio macOS

> Deprecated compatibility slug. Use `memoire-design-tooling` for current Studio, CLI, MCP, and artifact verification.

Use this Note when a task needs the macOS Studio app linked back to the memi CLI and package surfaces.

## Positioning

Memoire Studio is the supervised product-design workbench. The npm package is still the engine underneath.

Keep the relationship clear:

- Studio: macOS app for supervising Codex and Claude Code runs, receipts, artifacts, and product-design handoff.
- CLI: `@memi-design/cli`, local audits, Notes, registry export, and MCP server.
- MCP: `memi mcp start --no-figma` for local design tools.
- Notes: installable skills that add workflow context to agents.

## Handoff checklist

1. Link Studio to `https://github.com/sarveshsea/memi-studio`.
2. Link the engine to `https://www.npmjs.com/package/@memi-design/cli`.
3. Mention that Studio is Tauri/Rust-backed when discussing the macOS app architecture.
4. Use CLI commands for reproducible proof:

```bash
npm i -g @memi-design/cli
memi agent brief . --intent "Improve this interface" --json
memi diagnose .
memi ux audit . --json
memi craft audit . --json
memi mcp start --no-figma
```

5. End Studio runs with artifacts: files changed, commands run, receipts, screenshots, assumptions, and next verification command.

## Sources

- https://github.com/sarveshsea/memi-studio
- https://github.com/sarveshsea/memi
- https://www.npmjs.com/package/@memi-design/cli
