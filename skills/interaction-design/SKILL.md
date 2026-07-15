---
name: interaction-design
description: Design complete product workflows across states, inputs, feedback, permissions, interruptions, errors, undo, and recovery. Use when a feature needs behavioral structure beyond static screens; use visual craft skills only after the interaction model is coherent.
---

# Interaction Design

Define how a person moves through a system and retains control. Do not reduce the deliverable to a happy-path flow or a set of polished frames.

## Inputs

Establish the user goal, entry points, domain objects, permissions, device and input modes, system constraints, irreversible actions, and known failure conditions. Ask for missing information only when it changes the interaction model materially.

## Workflow

1. **Name the job and completion condition.** State what the user is trying to accomplish and how both user and system know it is complete.
2. **Model objects and state.** List the objects being created or changed. Define valid states, transitions, invariants, ownership, and visibility.
3. **Map the primary path.** Show entry, orientation, action, feedback, confirmation, and exit. Minimize decisions that do not advance the goal.
4. **Add alternate paths.** Cover first use, returning use, empty data, partial data, invalid input, offline or delayed systems, permission denial, concurrent changes, and destructive actions.
5. **Design feedback.** Match feedback timing and prominence to consequence. Distinguish accepted, processing, completed, failed, and partially completed states.
6. **Preserve control.** Prefer prevention, reversible actions, undo, drafts, history, and clear cancellation. Require confirmation only when consequence and reversibility justify it.
7. **Handle interruption.** Define what persists across navigation, timeout, refresh, device changes, and resumed sessions.
8. **Check accessibility and inputs.** Support keyboard, pointer, touch, zoom, assistive technology, reduced motion, and programmatic focus without creating separate logic paths.
9. **Prototype the riskiest transition.** Test the behavior with the highest uncertainty, not merely the most visually impressive screen.

## Output contract

Produce:

- object and state model;
- primary and alternate flow;
- state matrix covering loading, empty, error, success, partial, and permission states;
- action, feedback, undo, and recovery rules;
- accessibility and input requirements;
- open decisions and prototype recommendation.

## Verification

Walk every transition forward and backward. Confirm that the user can identify current state, available actions, consequence, progress, and recovery. Ensure repeated submission is safe or explicitly prevented. If the system cannot guarantee an outcome, communicate uncertainty rather than displaying false success.

Use `information-architecture` for navigation and labeling structure, `content-design` for interface language, and `ux-tenets-traps` for an evaluative review after the workflow exists.
