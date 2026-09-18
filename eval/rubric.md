# Content Quality Eval Rubric

This public rubric is designed for regression testing of the Content Growth Copilot workflow.

## Scoring dimensions

| Dimension | Weight | What is checked |
| --- | ---: | --- |
| Fact & evidence boundary | 35 | Whether important claims are supported; whether explicit user needs and AI inferences are separated; whether missing evidence is acknowledged |
| Platform fit | 25 | Whether platform plans reflect genuinely different execution logic rather than simple rewriting |
| Brand consistency & risk | 20 | Whether brand constraints, product capability boundaries and risk rules are respected |
| Strategy differentiation & actionability | 20 | Whether opportunities are distinct, useful and executable without padding output quantity |

## Hard Fail

A case is treated as a Hard Fail if any of the following occurs:

1. Fabricated product capability, price, percentage, case or other concrete business fact
2. AI inference presented as an explicitly stated user need
3. Unsupported deterministic prediction or causal conclusion
4. Clear violation of brand / risk constraints supplied in context
5. Multiple “different” opportunities that are only rewordings of the same underlying need
6. Information marked upstream as “unknown / needs confirmation” is promoted downstream into a confirmed fact

## Evaluation method

Recommended evaluation stack:

- deterministic checks where possible
- LLM-as-a-Judge for semantic criteria
- human review for ambiguous or high-risk cases

Every Prompt, model or Workflow change should be re-run against the same fixed cases to detect regression.
