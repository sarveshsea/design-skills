---
name: information-architecture
description: Organize product content, objects, navigation, search, filters, labels, and hierarchy around user mental models and retrieval tasks. Use when people cannot find, understand, or predict where information and actions belong.
---

# Information Architecture

Create a structure that makes location, meaning, and movement predictable. Do not use visual hierarchy to conceal an unresolved taxonomy.

## Inputs

Collect representative content and objects, top user tasks, entry points, current navigation, search behavior, terminology, permissions, scale expectations, and analytics or research evidence. Sample real long-tail content, not only ideal examples.

## Workflow

1. **Inventory the domain.** List content types, objects, attributes, relationships, owners, lifecycle, and access rules. Flag duplicates and orphaned material.
2. **Prioritize retrieval tasks.** Identify what users need to find, compare, understand, or act on, including frequency and consequence.
3. **Elicit mental models.** Use interviews, search queries, support language, card sorting, and observed behavior. Separate internal organization language from user language.
4. **Define the taxonomy.** Create mutually understandable categories and facets. State inclusion rules, exclusions, synonyms, and governance ownership.
5. **Choose navigation patterns.** Match global, local, contextual, utility, and sequential navigation to task relationships. Avoid using nesting as the default solution.
6. **Design labels.** Prefer specific, familiar, parallel labels. Test ambiguous terms in context and provide disambiguation where categories overlap.
7. **Design retrieval.** Decide when browsing, search, filtering, sorting, saved views, or recommendations are appropriate. Define searchable fields and useful zero-result recovery.
8. **Model growth and permissions.** Test deep content, large counts, role differences, localization, archived states, and future object types.
9. **Validate.** Use tree testing for findability, card sorting for grouping, first-click tests for orientation, and task-based usability tests for the complete experience.

## Output contract

Return:

- domain inventory and object relationships;
- prioritized retrieval tasks;
- taxonomy with category rules and synonyms;
- navigation map;
- search, filter, and sorting model;
- labeling decisions;
- validation plan and governance owner.

## Verification

Test whether a new user can predict where an item belongs, whether one item has an intentional home, whether labels remain meaningful out of context, and whether permissions or scale create dead ends. Record contested classifications instead of forcing false consensus.

Use `content-design` for terminology systems and `interaction-design` for the behavior of navigation, filtering, and search controls.
