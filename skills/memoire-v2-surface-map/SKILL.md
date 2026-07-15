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
| MCP server | `server.json` in `sarveshsea/memi` | `memi mcp start --no-figma` |
| Agent Skills | `skills/memoire-design-tooling/SKILL.md` | `npx skills add sarveshsea/memi --skill memoire-design-tooling` |
| Codex plugin | `plugins/memoire` | `codex plugin marketplace add sarveshsea/memi --ref main --sparse .agents/plugins --sparse plugins/memoire` |
| macOS Studio | `sarveshsea/memi-studio` | Tauri/Rust-backed app linked to CLI and MCP workflows |
| Proof sandbox | `sarveshsea/design-sandbox` | `pnpm memi:agent`, `pnpm memi:diagnose`, `pnpm memi:ux`, `pnpm verify` |
| Design Skills | `sarveshsea/design-skills` | `npx skills add sarveshsea/design-skills` or `memi notes install <name> --catalog https://www.memoire.cv/notes/community/catalog.v1.json` |

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

- https://github.com/sarveshsea/memi
- https://www.npmjs.com/package/@memi-design/cli
- https://github.com/sarveshsea/memi-studio
- https://github.com/sarveshsea/design-sandbox
- https://github.com/sarveshsea/design-skills
