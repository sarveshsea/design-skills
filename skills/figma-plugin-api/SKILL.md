---
name: figma-plugin-api
description: Route exact Figma Plugin API questions to current official typings and developer documentation without redistributing upstream reference material. Use when an implementation depends on verified node, variable, component, style, or editor API behavior.
---

# Figma Plugin API Reference Router

Do not answer exact API questions from memory when current official reference material is available.

## Procedure

1. Identify the exact API concept, editor type, node type, and operation involved.
2. Search the current official Figma Plugin API documentation and typings for the relevant symbol.
3. Verify method availability, asynchronous behavior, permissions, supported editors, and documented limitations.
4. Build the smallest test or read-only inspection needed before attempting a write.
5. Keep writes incremental and validate the resulting file state.
6. Cite the official symbol or page and access date.
7. If the official reference is unavailable or ambiguous, stop before destructive writes and report the unresolved contract.

Official sources:

- [Figma Plugin API reference](https://developers.figma.com/docs/plugins/api/api-reference/)
- [Figma MCP Server Guide](https://github.com/figma/mcp-server-guide)

Return the verified API contract, minimal implementation approach, validation, and any version-sensitive uncertainty.
