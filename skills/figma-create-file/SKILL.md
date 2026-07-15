---
name: figma-create-file
description: Route creation of a new Figma Design or FigJam file to Figma's current official MCP workflow without reproducing upstream instructions. Use when an authorized Figma integration must create a new file before another workflow begins.
---

# Figma Create File Router

This repository does not redistribute Figma's workflow text. Use this router to locate and invoke the official resource.

## Procedure

1. Confirm that a new file is required and that an existing target cannot be used.
2. Confirm the requested editor type, destination workspace or plan, name, and access expectations.
3. Load Figma's current file-creation skill from the official MCP guide distribution.
4. Follow the official authorization and file-creation workflow.
5. Return the created file identifier and URL without exposing credentials or unrelated workspace data.
6. If the official skill or creation capability is unavailable, provide the source link and stop. Do not simulate a successful file creation.

Official source: [Figma MCP Server Guide](https://github.com/figma/mcp-server-guide)

After creation, route the user to the bounded workflow they requested. Creating a blank file is a prerequisite, not a substitute for design work.
