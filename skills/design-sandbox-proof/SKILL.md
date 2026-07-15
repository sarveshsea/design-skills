---
name: design-sandbox-proof
description: Use design-sandbox as the public proof repo for memi, MCP, Agent Skills, and interface craft.
---

# Design Sandbox Proof

> Deprecated compatibility slug. Use `memoire-design-tooling` for current setup and release-surface verification.

Use this Note when a user asks for a real repo that proves memi works with app code, MCP, Agent Skills, Tailwind, shadcn, UX audit, and interface craft.

## Clone and verify

```bash
git clone https://github.com/sarveshsea/design-sandbox.git
cd design-sandbox
pnpm install
pnpm memi:agent
pnpm memi:diagnose
pnpm memi:ux
memi craft audit . --json
pnpm memi:tokens
pnpm verify
```

## What to inspect

- `.agents/skills/memoire-design-tooling/SKILL.md`
- `.mcp.json`
- `memoire.agent.yaml`
- `AGENTS.md`
- package scripts for memi proof commands
- UI routes that should remain Tailwind/shadcn compatible

## Proof language

Use design-sandbox as the external "show me" surface:

```text
design-sandbox is the public memi proof workspace: a small Next.js/Tailwind/shadcn repo wired with MCP, Agent Skills, memi diagnostics, UX audit, interface craft, tokens, and verification commands.
```

## Sources

- https://github.com/sarveshsea/design-sandbox
- https://github.com/sarveshsea/memi
- https://www.npmjs.com/package/@memi-design/cli
