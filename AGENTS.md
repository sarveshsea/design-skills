# Agent instructions

- Treat `skills/<slug>/SKILL.md` as the canonical workflow surface.
- Treat `registry/skills.json` and `registry/collections/*.json` as the canonical behavioral metadata and collection surfaces.
- Treat `provenance.json` as the canonical legal and source record.
- Keep skill frontmatter to `name` and `description` only.
- Keep entrypoints under 500 lines and use one-level `references/` for detail.
- Preserve every source's license, author, repository, and immutable commit in `provenance.json`.
- Never import paid, gated, or unlicensed prose without written permission.
- Give every public canonical skill one bounded primary intent, an explicit portability class, declared capabilities, and at least one collection.
- Never use `always` activation. Internal, deprecated, or quarantined skills must not enter public default collections.
- Run `npm run sync` after source, registry, or documentation changes and `npm run check` before handoff.
- Do not edit generated `catalog.json` or `note.json` files by hand when `scripts/sync-catalog.mjs` can express the change.
