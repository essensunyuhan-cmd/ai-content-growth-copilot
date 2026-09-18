# Iteration Log

## V1 — fixed-output workflow

Initial V1 established the basic chain:

**User insight → Content opportunity → Content strategy → Multi-platform plan**

The first goal was to make each stage observable rather than hide all reasoning inside one large prompt.

### Problem discovered

During evaluation, the content-opportunity node showed a stable failure pattern:

> When the model was forced to output a fixed number of opportunities, it could repeat the same underlying user need with different wording or expand needs that were not supported by evidence.

This is a product problem rather than a formatting problem because it directly lowers decision quality.

## V1.1 — decision density over output quantity

### P0 changes

1. Change content-opportunity count from a fixed quantity to **1–3 dynamic outputs**
2. Deduplicate at the underlying user-problem / JTBD level
3. Require every opportunity to add meaningful information
4. Keep user-demand evidence and historical-performance evidence separate
5. When evidence is weak, downgrade the opportunity or do not output it
6. Preserve Fact / Inference / Hypothesis boundaries through downstream nodes

### Why this matters

The iteration target is not “make the model generate more”.

It is:

> **Reduce low-value recommendations and increase the density of evidence-backed decisions.**

## Next validation

Planned validation should compare V1 and V1.1 on the same fixed cases and inspect:

- duplicate-opportunity rate
- evidence consistency
- unsupported-need rate
- hard-fail rate
- operator adoption behavior

No simulated or teaching-only numbers should be treated as real user or commercial results.
