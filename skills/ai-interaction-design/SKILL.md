---
name: ai-interaction-design
description: Design trustworthy human-AI workflows with clear automation boundaries, provenance, uncertainty, editable outputs, consent, memory controls, latency states, evaluation, and recovery. Use when AI generates, recommends, acts, or remembers on a person's behalf.
---

# AI Interaction Design

Design the relationship between human judgment and model behavior. Do not hide uncertainty, imply deterministic capability, or automate consequential actions without appropriate review and control.

## Inputs

Establish the user goal, model role, source data, tools and actions, consequence level, latency, memory behavior, privacy constraints, evaluation evidence, failure modes, and the person accountable for the outcome.

## Workflow

1. **Define the automation boundary.** Separate what the model may suggest, draft, decide, execute, and remember. Match autonomy to consequence, reversibility, observability, and user expertise.
2. **Set expectations.** Explain what the system can do, what information it uses, important limitations, expected latency, and when human review is required.
3. **Design input and context.** Show what context is included, allow correction, protect sensitive information, and avoid requesting data the task does not require.
4. **Design progressive output.** Represent queued, retrieving, generating, tool-use, awaiting approval, completed, partial, and failed states. Preserve useful partial work when safe.
5. **Expose provenance and uncertainty.** Attach sources to claims, distinguish retrieved facts from generated inference, communicate material uncertainty, and provide a path to inspect evidence.
6. **Keep outputs editable.** Let users revise, compare, regenerate selectively, restore earlier versions, and understand what changed. Avoid all-or-nothing regeneration.
7. **Gate consequential actions.** Preview scope, target, cost, and side effects before execution. Require confirmation at the last responsible moment and provide receipts, undo, or escalation.
8. **Design memory controls.** Make remembered information visible, correctable, removable, scoped, and time-bounded. Do not make personalization depend on opaque retention.
9. **Handle failure.** Distinguish unavailable tools, insufficient evidence, policy refusal, model uncertainty, timeout, and partial execution. Offer truthful recovery rather than generic retry loops.
10. **Evaluate the whole workflow.** Measure task success, factuality, groundedness, calibration, harmful action rate, correction burden, latency, accessibility, trust, and subgroup effects.

## Output contract

Produce:

- responsibility and automation-boundary matrix;
- context and consent model;
- state and latency model;
- output, provenance, and uncertainty rules;
- approval, action, receipt, and recovery flow;
- memory controls;
- evaluation and monitoring plan.

## Verification

Run plausible incorrect, stale, adversarial, ambiguous, and partially completed scenarios. Confirm that users can identify what the AI did, why, with which sources, what remains uncertain, what will happen next, and how to correct or stop it. Escalate high-consequence domains to appropriate policy and subject-matter review.

Use `interaction-design` for the surrounding workflow, `content-design` for expectation and recovery language, and `design-measurement-and-experimentation` for evaluation design.
