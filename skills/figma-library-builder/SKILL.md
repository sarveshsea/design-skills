---
name: figma-library-builder
description: Route a Figma library build to Figma's current official MCP workflow and this repository's portable design-system skills without reproducing upstream instructions. Use when creating tokens, components, documentation, and code mappings in Figma.
---

# Figma Library Builder Router

> Deprecated compatibility slug. Use `figma-generate-library` for the canonical library-generation workflow.

Use `design-systems` and `token-architecture` to make platform-neutral architecture decisions. Use the official Figma workflow for current product and API execution details.

## Procedure

1. Inventory the codebase token sources, components, naming, variants, accessibility requirements, and release constraints.
2. Inspect the target Figma file and existing libraries before proposing new assets.
3. Produce a mapping plan from code concepts to Figma concepts and obtain approval for destructive or large-scale changes.
4. Load Figma's current library-generation skill from the official MCP guide distribution.
5. Execute in bounded phases, validating created assets and visual output after each phase.
6. Preserve Code Connect and local component identities where they already exist.
7. If the official workflow is unavailable, return the architecture and migration plan without performing Figma mutations.

Official source: [Figma MCP Server Guide](https://github.com/figma/mcp-server-guide)

Return the architecture, mappings, assets created, validation evidence, and remaining migration work.
