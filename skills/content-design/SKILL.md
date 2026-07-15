---
name: content-design
description: Design clear, consistent product language for navigation, actions, forms, onboarding, empty states, errors, confirmations, permissions, and trust-sensitive moments. Use when words affect comprehension, action, recovery, or confidence.
---

# Content Design

Treat language as part of the interaction model. Do not polish isolated strings without understanding user intent, system state, consequence, and next action.

## Inputs

Gather the user goal, audience knowledge, product terminology, voice principles, interface states, legal constraints, localization needs, character constraints, and evidence from research, support, search, or analytics.

## Workflow

1. **Define the communication job.** State what the user needs to understand or do at this moment and what the system knows.
2. **Establish terminology.** Create one preferred term for each concept, record synonyms and prohibited ambiguity, and align labels across navigation, UI, help, notifications, and support.
3. **Write in action order.** Lead with the information or action needed now. Use specific verbs and concrete objects. Remove throat-clearing and internal system language.
4. **Match copy to state.** Distinguish initial, loading, empty, partial, success, warning, error, blocked, expired, and offline states.
5. **Design actions and consequences.** Button labels should predict the immediate result. Pair destructive or high-trust actions with consequence, scope, and reversibility.
6. **Write recovery.** Explain what happened, what remains safe, what the user can do next, and where responsibility lies. Do not blame the user or expose raw implementation errors.
7. **Handle trust.** Explain permissions, automation, data use, billing, and irreversible changes before commitment. Avoid coercive urgency or disguised consent.
8. **Prepare localization.** Avoid embedded word order, idioms, concatenated fragments, unexplained abbreviations, and layouts that fail under text expansion or RTL.
9. **Test comprehension.** Use cloze tests, first-click tasks, interviews, support review, and production behavior where consequence warrants it.

## Output contract

Deliver:

- communication objective and audience context;
- terminology decisions;
- state-by-state copy table;
- action and confirmation language;
- error and recovery patterns;
- localization and accessibility notes;
- unresolved legal or policy dependencies.

## Verification

Read every string in its real state and sequence. Confirm that labels remain distinct, actions predict outcomes, errors provide recovery, copy does not promise an unconfirmed result, and critical meaning is not carried by color or placement alone.

Use `information-architecture` for taxonomy and navigation structure, `interaction-design` for state behavior, and `ai-interaction-design` when language describes generated output, uncertainty, or automation.
