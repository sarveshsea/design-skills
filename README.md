# Memoire Community Notes

Community Memoire Notes are markdown skill packs that extend `@memi-design/cli` with reviewed design, research, agent, MCP, Studio, and sandbox workflows.

This repo is the community side of the memi ecosystem:

| Surface | Link | What it carries |
| --- | --- | --- |
| npm engine | [`@memi-design/cli`](https://www.npmjs.com/package/@memi-design/cli) | `memi` CLI, app-quality audits, interface craft, shadcn registry export, Notes, and MCP server. |
| Engine repo | [`sarveshsea/memi`](https://github.com/sarveshsea/memi) | Source for the npm package, built-in Notes, Agent Skills, Codex plugin, release gates, and docs. |
| MCP server | [`server.json`](https://github.com/sarveshsea/memi/blob/main/server.json) | Registry-safe stdio entrypoint: `memi mcp start --no-figma`. |
| Agent Skills | [`skills/memoire-design-tooling`](https://github.com/sarveshsea/memi/tree/main/skills/memoire-design-tooling) | Installable skill package for design-aware coding agents. |
| macOS Studio | [`sarveshsea/memi-studio`](https://github.com/sarveshsea/memi-studio) | Tauri/Rust-backed macOS workbench for supervised Codex and Claude Code product-design runs. |
| Proof sandbox | [`sarveshsea/design-sandbox`](https://github.com/sarveshsea/design-sandbox) | Public Next.js/Tailwind/shadcn workspace wired for memi, MCP, Agent Skills, and proof commands. |
| Community Notes | [`sarveshsea/memoire-community-notes`](https://github.com/sarveshsea/memoire-community-notes) | Reviewed community skill packs published into the community Notes catalog. |

## Install memi

```bash
npm i -g @memi-design/cli
memi --help
memi mcp start --no-figma
```

## Install community Notes

Community Notes publish through:

```text
https://www.memoire.cv/notes/community/catalog.v1.json
```

Install a community Note by name:

```bash
memi notes install memoire-v2-surface-map --catalog https://www.memoire.cv/notes/community/catalog.v1.json
memi notes install interface-craft-gate --catalog https://www.memoire.cv/notes/community/catalog.v1.json
memi notes list
```

For local review from this checkout:

```bash
MEMOIRE_COMMUNITY_NOTES_ROOT="$PWD" npm --prefix ../memi run check:community-notes
MEMOIRE_COMMUNITY_NOTES_ROOT="$PWD" npm --prefix ../memi run build:community-notes-catalog
```

## Included starter Notes

| Note | Purpose |
| --- | --- |
| `memoire-v2-surface-map` | Keeps npm, MCP, Agent Skills, Codex plugin, Studio, sandbox, and community Notes linked in one handoff. |
| `memoire-mcp-agent-skills` | Sets up local MCP and Agent Skills for design-aware coding agents. |
| `memoire-studio-macos` | Connects the Tauri/Rust macOS Studio app to the CLI, MCP, receipts, and project artifacts. |
| `design-sandbox-proof` | Uses `sarveshsea/design-sandbox` as the public proof repo for memi setup and verification. |
| `interface-craft-gate` | Makes `memi craft audit` part of the first-class interface design craft loop. |

## Note structure

Each package lives at `notes/<note-name>/` and contains:

- `note.json` with Memoire Note metadata
- one or more markdown skill files referenced by `note.json`
- optional resources that are never executed during install

## Review rules

Community Notes must include:

- kebab-case `name`
- semver `version`
- `sourceUrls`
- `lastResearchedAt`
- `freshnessDays`
- safe relative markdown skill paths
- no install-time scripts

Installs do not execute scripts from downloaded archives. Any resource files are treated as passive content until a human or agent reviews them.

## Distribution proof

Use this repo when submitting memi to MCP, Agent Skills, shadcn, and agent-template directories. Every submission should point at one installable Note plus a runnable CLI proof:

```bash
npm i -g @memi-design/cli
memi notes install memoire-mcp-agent-skills --catalog https://www.memoire.cv/notes/community/catalog.v1.json
memi mcp start --no-figma
```

Catalog health check:

```bash
curl -fsSL https://www.memoire.cv/notes/community/catalog.v1.json
```

The live catalog should contain at least the five starter Notes above. If it returns an empty `notes` array, fix `memoire.cv` before doing any outreach.

## Submit a Note

1. Fork this repo.
2. Add or update a folder in `notes/`.
3. Run validation:

```bash
MEMOIRE_COMMUNITY_NOTES_ROOT="$PWD" npm --prefix ../memi run check:community-notes
```

4. Open a pull request.

Approved Notes are packaged into the community marketplace catalog:

```text
https://www.memoire.cv/notes/community/catalog.v1.json
```
