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


## V1.2 — prompt refactor and workflow performance

### Problem observed

The multi-node workflow accumulated long system prompts and long intermediate outputs across downstream nodes. On the same fixed test case, the V1.1 baseline reached:

- Runtime: **87.767s**
- Total tokens: **35,519**

### Changes

1. Refactor repeated system-prompt rules into shorter principle-based constraints
2. Compress intermediate outputs while preserving evidence and risk boundaries
3. Keep content opportunities dynamic at 1–3 rather than padding output
4. Run historical-performance review and user-insight analysis as parallel upstream branches
5. Keep the final API-facing output focused on:
   - user insight
   - content opportunities
   - platform plan

### Result on the same test case

| Version | Runtime | Total Tokens |
| --- | ---: | ---: |
| V1.1 baseline | 87.767s | 35,519 |
| V1.2 final | 37.288s | 16,469 |

Compared with the baseline, runtime decreased by about **57.5%** and token usage by about **53.6%**.

The optimization target was lower latency and cost without removing the product's core evidence, product-boundary, and risk-control constraints.
