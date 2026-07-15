---
name: figma-code-connect
description: Route a Figma Code Connect request to Figma's current official workflow and documentation without reproducing upstream instructions. Use when mapping published Figma components to code implementations requires the official Figma MCP integration.
---

# Figma Code Connect Router

This repository does not redistribute Figma's workflow text. Use this router to locate and invoke the official resource.

## Procedure

1. Confirm that the user wants Code Connect mapping rather than canvas creation or design-to-code implementation.
2. Confirm that the connected client exposes the required official Figma MCP and Code Connect capabilities.
3. Load Figma's current `figma-code-connect-components` skill from the official MCP guide distribution.
4. Follow the official workflow and current plan, permission, publishing, and mapping requirements.
5. Record the official source revision or access date used for the work.
6. If the official skill is unavailable, provide the source link and stop before inventing tool calls or mutating mappings.

Official source: [Figma MCP Server Guide](https://github.com/figma/mcp-server-guide)

Return the mappings created or reviewed, validation evidence, unresolved prerequisites, and the official source used.
