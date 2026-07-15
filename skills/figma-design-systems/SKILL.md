---
name: figma-design-systems
description: Route Figma-specific component, variable, style, and library questions to Figma's current official design-system guidance without reproducing upstream material. Use as a reference when exact Figma behavior matters.
---

# Figma Design Systems Reference Router

Use the repository's portable `design-systems` and `token-architecture` skills for general system decisions. Use this router only when the decision depends on current Figma product behavior.

## Procedure

1. Identify whether the question concerns components, variables, text styles, effect styles, libraries, or permissions.
2. Open Figma's current official MCP guide and developer documentation.
3. Verify the relevant API or product behavior against the current documentation and plan constraints.
4. Apply the portable design-system decision first, then map it to the verified Figma mechanism.
5. Cite the official page and access date used.
6. If current official documentation is unavailable, state the uncertainty and avoid irreversible library changes.

Official sources:

- [Figma MCP Server Guide](https://github.com/figma/mcp-server-guide)
- [Figma Developer documentation](https://developers.figma.com/)

Do not treat this router as copied Figma documentation or as a complete library-building workflow.
