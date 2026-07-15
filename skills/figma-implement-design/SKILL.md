---
name: figma-implement-design
description: Route Figma-to-code implementation to Figma's current official MCP workflow while preserving repository conventions and independent verification. Use when a supplied Figma selection must become production code.
---

# Figma Implement Design Router

This repository does not reproduce Figma's implementation skill. Use the official workflow as the integration layer and the local codebase as the implementation authority.

## Procedure

1. Confirm the exact Figma file or selection and the target repository surface.
2. Read local instructions, components, tokens, framework conventions, tests, and accessibility requirements.
3. Load Figma's current implementation skill from the official MCP guide distribution.
4. Use the official integration to obtain current design context and assets.
5. Reuse local components and tokens before creating new ones.
6. Implement through the repository's normal test and review workflow.
7. Compare the result against the supplied design at representative states and viewport sizes.
8. If the official skill is unavailable, request exported context or screenshots and proceed only as an explicitly limited static implementation.

Official source: [Figma MCP Server Guide](https://github.com/figma/mcp-server-guide)

Return files changed, reused components, verification evidence, visual differences, and unresolved integration limits.
