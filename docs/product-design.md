# Product Design

## Product positioning

AI Content Growth Copilot is a decision-support workflow for content operators and small content teams.

Its core question is not **“How can AI write more content?”** but:

> **What should we do next, why is it worth doing, and what evidence supports that decision?**

## Target users

- New media / content operators
- Small content teams
- Product / brand operators who need to turn fragmented user feedback and historical content performance into actionable content decisions

## Core job to be done

When operators have product information, user feedback, historical content data and business goals, they need to identify the highest-value content opportunities and translate them into executable platform strategies without inventing unsupported user needs or product capabilities.

## Current workflow

1. **Content performance review**
   - Reads historical content data and baseline metrics
   - Separates Fact / Inference / Hypothesis
   - Classifies evidence as Level A / B / C
   - Produces next-round experiment suggestions

2. **User insight**
   - Extracts explicit user needs and AI inferences separately
   - Requires evidence for each important judgment
   - Does not generate topics or copy

3. **Content opportunity discovery**
   - Combines user evidence, historical signals, product fit and business goal
   - Outputs only 1–3 differentiated opportunities when evidence supports them
   - Keeps user-demand strength, product fit and growth potential as separate dimensions

4. **Product fact retrieval**
   - RAG retrieves confirmed product facts and capability boundaries
   - Unsupported capabilities must not be filled in from general industry knowledge

5. **Content strategy**
   - Converts selected opportunities into execution-ready strategies
   - Separates existing supporting information from missing information
   - Does not fabricate prices, cases, percentages or product capabilities

6. **Brand / expression retrieval**
   - RAG retrieves brand and content-expression constraints

7. **Multi-platform execution**
   - Adapts the same strategy to different platform logics
   - Avoids simple rewriting
   - Keeps unverifiable platform assumptions explicitly labeled as estimates

## Why Workflow instead of full Agent

The main business path is stable and the responsibility of each node is clear. A Workflow is therefore preferred for V1 because it is:

- controllable
- observable
- testable
- easier to debug
- suitable for node-level and end-to-end regression

Agent behavior is better reserved for future open-ended tasks such as external research, competitor search or trend discovery.

## Human-in-the-loop

The system provides evidence, opportunities and strategy recommendations. Final prioritization and publishing decisions remain human decisions because they may depend on:

- current business strategy
- resource constraints
- brand risk
- real production cost
- timing and market context

## Success criteria

The product should not be judged by generation volume.

Primary product-level success should focus on:

- effective content opportunity adoption rate
- reduction in repeated / low-information suggestions
- evidence quality and traceability
- decrease in operator screening cost

Offline Eval and online user behavior should be considered together.
