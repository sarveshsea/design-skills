---
name: figma-ds-rules
description: Route generation of Figma-aware repository rules to Figma's current official MCP workflow without reproducing upstream instructions. Use when AGENTS.md, CLAUDE.md, or client rules must reflect verified Figma and codebase conventions.
---

# Figma Design-System Rules Router

This router connects a repository-specific rules request to the official Figma resource.

## Procedure

1. Read the repository's existing instructions, component locations, token sources, frameworks, and test conventions.
2. Separate project facts from generic preferences and unverified assumptions.
3. Load Figma's current design-system-rules skill from the official MCP guide distribution.
4. Generate the smallest ruleset that records verified repository conventions and the official Figma integration sequence.
5. Preserve existing higher-priority instructions and avoid duplicating rules already enforced by code or CI.
6. Validate the result against one representative design-to-code task.
7. If the official resource is unavailable, provide the source link and limit the output to verified repository facts.

Official source: [Figma MCP Server Guide](https://github.com/figma/mcp-server-guide)

Return the rules changed, evidence for each repository-specific claim, validation performed, and remaining uncertainty.
