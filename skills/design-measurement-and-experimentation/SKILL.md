---
name: design-measurement-and-experimentation
description: Connect design decisions to measurable outcomes through metric trees, behavioral instrumentation, guardrails, experiment plans, and post-launch reviews. Use when a team must determine whether a design worked rather than whether it shipped.
---

# Design Measurement and Experimentation

Define evidence that can change a decision. Do not manufacture certainty from weak proxies, underpowered samples, or metrics selected after results are known.

## Inputs

Collect the decision, target behavior, affected population, baseline, product constraints, existing event taxonomy, data quality, expected time to effect, risk, and ability to randomize or compare.

## Workflow

1. **State the causal hypothesis.** Define the design change, expected behavior mechanism, population, outcome, and disconfirming result.
2. **Build a metric tree.** Connect the user outcome to observable behaviors, product events, and operational measures. Separate leading indicators from lagging outcomes.
3. **Choose one primary metric.** It must be sensitive to the intended behavior, interpretable, and difficult to improve through harmful shortcuts.
4. **Add guardrails.** Cover accessibility, errors, time cost, trust, retention, support burden, revenue risk, and effects on excluded populations as relevant.
5. **Specify instrumentation.** Define event name, trigger, actor, object, properties, timestamp, deduplication, privacy classification, and validation owner. Never collect data without a decision use.
6. **Select the evidence design.** Use an experiment only when randomization is ethical and operationally valid. Otherwise choose a phased rollout, matched comparison, interrupted time series, usability benchmark, or qualitative follow-up.
7. **Predefine analysis.** Record population, exclusions, segments, minimum detectable effect, decision threshold, duration, novelty effects, and stopping rules before reading results.
8. **Validate data.** Test event firing, missingness, duplicates, identity joins, timezone, bot traffic, and consistency with source-of-record totals.
9. **Review and decide.** Report effect size and uncertainty, guardrail movement, segment differences, limitations, and the decision. Preserve null and negative results.

## Output contract

Return:

- causal hypothesis;
- metric tree with primary metric and guardrails;
- instrumentation specification;
- evidence or experiment design;
- pre-analysis and decision rules;
- data-quality checks;
- post-launch review date and owner.

## Verification

Confirm that the primary metric reflects the user outcome, instrumentation can be tested before launch, guardrails catch plausible harm, and the planned analysis could lead to stopping or reversing the design. Explicitly state when sample size, bias, novelty, or missing data prevents a causal conclusion.

Use `product-discovery-and-framing` to define the opportunity and `usability-testing` when behavioral explanation matters more than aggregate effect.
