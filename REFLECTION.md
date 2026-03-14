# Reflection — AI Agent-Assisted Development

## What I Learned Using AI Agents

Building this FuelEU Maritime compliance platform with AI assistance revealed how fundamentally the development workflow shifts when agents are involved. The most striking insight was that **the quality of output is proportional to the precision of the prompt**. Vague prompts like "implement banking" produced generic code; specific prompts referencing exact article numbers, formula constants, and edge cases produced near-production-ready implementations.

The second important learning was around **architecture as prompt context**. When I established the hexagonal architecture pattern early and explicitly described it in each subsequent prompt ("this use-case must not import from Express"), the agent maintained the separation of concerns consistently across dozens of files. Without that upfront framing, agents tend to blur layers — writing repository logic in controllers or importing framework types into domain code.

## Efficiency Gains vs Manual Coding

| Task                         | Manual Estimate | With AI Agent | Saving   |
| ---------------------------- | --------------- | ------------- | -------- |
| Domain entities & interfaces | 45 min          | 5 min         | 89%      |
| Use-case implementations     | 3 hrs           | 30 min        | 83%      |
| Prisma schema + seed         | 30 min          | 8 min         | 73%      |
| React tab components         | 4 hrs           | 45 min        | 81%      |
| Unit test generation         | 2 hrs           | 20 min        | 83%      |
| Documentation                | 1 hr            | 10 min        | 83%      |
| **Total**                    | **~11 hrs**     | **~2 hrs**    | **~82%** |

The key efficiency gains came from:

- Eliminating lookup time (API docs, syntax) — agent knows idiomatic patterns
- Generating structural boilerplate in seconds (interfaces, test files, DI wiring)
- Exploring design trade-offs through conversation rather than solo research

## Where AI Fell Short

Agents are strong at pattern-matching familiar code but struggle with:

1. **Domain correctness**: The fuel-specific formulas (gCO₂e/MJ energy conversion, target derivation) required manual verification against the regulation PDF. Agents guessed plausible but incorrect values initially.
2. **Cross-file consistency**: When multiple files share implicit contracts (e.g., the `ApiResponse<T>` shape), the agent sometimes generated mismatched types between backend `ok(data)` and frontend `res.data.data!`.
3. **Edge case awareness**: Business rules like "surplus ship cannot exit negative" needed to be explicitly stated; agents didn't infer them from the Article 21 description without prompting.

## Improvements for Next Time

1. **Create a `SPEC.md` first** — Capture all domain constants, formulas, and business rules in a single file, then reference it in every prompt. This prevents formula drift across generated files.
2. **Test-first prompting** — Ask the agent to generate the unit test cases before the implementation. This forces the agent to think through edge cases and creates a specification that the implementation must satisfy.
3. **Type-check incrementally** — Run `tsc --noEmit` after each major agent output rather than at the end. Cross-file type errors are much harder to fix in batches.
4. **Use agents for refactoring more aggressively** — The biggest untapped value is asking agents to reduce complexity in working code, not just generate new code. A "refactor this component to be under 100 lines" prompt consistently produces cleaner results than expecting perfect output on first generation.
5. **Separate generation from validation** — Always review agent output in a separate pass with "find any bugs or missing edge cases in this code." Agents are better at critique than creation in this mode.
