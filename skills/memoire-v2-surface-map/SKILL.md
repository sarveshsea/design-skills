---
name: memoire-v2-surface-map
description: Connect the memi v2 public surfaces before publishing, onboarding agents, or writing docs.
---

# Memoire v2 Surface Map

> Deprecated compatibility slug. Use `memoire-design-tooling` for current public-surface and release verification.

Use this Note when a task needs the memi ecosystem linked consistently across npm, MCP, Agent Skills, Codex plugin, Studio, sandbox, and community Notes.

## Canonical surfaces

| Surface | Source | Required link or command |
| --- | --- | --- |
| npm package | `@memi-design/cli` | `npm i -g @memi-design/cli` |
| CLI proof | local `memi` binary | `memi diagnose`, `memi ux audit --json`, `memi craft audit --json`, `memi tokens --from ./src --report` |
| MCP server | `server.json` in `memi-design/memi` | `memi mcp start --no-figma` |
| Agent Skills | `skills/memoire-design-tooling/SKILL.md` | `npx skills add memi-design/memi --skill memoire-design-tooling` |
| Codex plugin | `plugins/memoire` | `codex plugin marketplace add memi-design/memi --ref main --sparse .agents/plugins --sparse plugins/memoire` |
| macOS Studio | `memi-design/memi-studio` | Current Tauri/Rust-backed companion linked to CLI and MCP workflows |
| Proof sandbox | `memi-design/design-sandbox` | `pnpm memi:agent`, `pnpm memi:diagnose`, `pnpm memi:ux`, `pnpm verify` |
| Design Skills | `memi-design/design-skills` | `npx skills add memi-design/design-skills` or `memi notes install <name> --catalog https://memoire.cv/notes/community/catalog.v1.json` |

## Review checklist

1. The npm package link points to `https://www.npmjs.com/package/@memi-design/cli`.
2. MCP docs use `memi mcp start --no-figma` for the safe default path.
3. Agent docs include both `memi agent install --dry-run --json` and the Agent Skills install command.
4. Studio docs describe the macOS app as the supervised workbench, not a replacement for the CLI engine.
5. Sandbox docs include commands that a user can run without Figma.
6. Community Note docs point to the community catalog and keep `sourceUrls`, `lastResearchedAt`, and `freshnessDays` fresh.

## Handoff language

Use this concise summary when linking surfaces:

```text
memi is interface understanding for AI coding agents. Install the npm CLI, expose the MCP server locally, add the Agent Skills package, use the Tauri/Rust macOS Studio app for supervised runs, and verify everything in the design-sandbox proof repo.
```

## Sources

- https://github.com/memi-design/memi
- https://www.npmjs.com/package/@memi-design/cli
- https://github.com/memi-design/memi-studio
- https://github.com/memi-design/design-sandbox
- https://github.com/memi-design/design-skills
