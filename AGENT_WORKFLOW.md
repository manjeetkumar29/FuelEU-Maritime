# AI Agent Workflow Log

## Agents Used

| Agent                        | Version           | Primary Use                                                                                  |
| ---------------------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| **Claude Code (Sonnet 4.6)** | claude-sonnet-4-6 | Primary development agent — architecture design, code generation, refactoring, documentation |
| **GitHub Copilot**           | Latest            | Inline completions for boilerplate, TypeScript type annotations                              |
| **Cursor Agent**             | Latest            | Multi-file refactoring and contextual code edits                                             |

---

## Prompts & Outputs

### Example 1 — Domain Formula Implementation

**Prompt given to Claude Code:**

```
Implement the FuelEU Maritime Compliance Balance formula per Annex IV of
Regulation (EU) 2023/1805. Target intensity for 2025 is 89.3368 gCO2e/MJ
(2% below reference 91.16). Energy = fuelConsumption × 41,000 MJ/t.
CB = (Target - Actual) × Energy. Implement as pure functions with no
framework dependencies.
```

**Generated output (ComplianceFormulas.ts):**

```typescript
export const FUEL_EU_CONSTANTS = {
  TARGET_INTENSITY_2025: 89.3368,
  ENERGY_CONVERSION_MJ_PER_TONNE: 41_000,
  REFERENCE_INTENSITY: 91.16,
} as const;

export function computeComplianceBalance(
  actualIntensity: number,
  fuelConsumptionTonnes: number,
  targetIntensity = FUEL_EU_CONSTANTS.TARGET_INTENSITY_2025,
): number {
  const energy =
    fuelConsumptionTonnes * FUEL_EU_CONSTANTS.ENERGY_CONVERSION_MJ_PER_TONNE;
  return (targetIntensity - actualIntensity) * energy;
}
```

**Validation:** Manually verified R002 (LNG 88.0 gCO₂e/MJ, 4800t):

- Energy = 4800 × 41000 = 196,800,000 MJ
- CB = (89.3368 - 88.0) × 196,800,000 = +263,107,200 gCO₂eq ✅ (surplus)

---

### Example 2 — Banking Business Rules

**Prompt:**

```
Implement BankSurplusUseCase following FuelEU Article 20. Rules:
- amount must be positive
- ship must have a positive CB (surplus)
- amount cannot exceed available CB
- store as BANKED entry in bank_entries table
Throw appropriate domain errors (ValidationError, BusinessRuleError, NotFoundError).
```

**Generated output:** Complete `BankSurplusUseCase` with all validations.

**Correction applied:** Initially the agent allowed banking equal to CB; we refined to
`amount > compliance.cbGco2eq` (strict >).

---

### Example 3 — Greedy Pool Allocation

**Prompt:**

```
Implement CreatePoolUseCase for FuelEU Article 21 pooling. Requirements:
- Sum(CB) must be ≥ 0
- Deficit ships cannot exit worse
- Surplus ships cannot exit negative
- Use greedy allocation: sort members desc by CB, transfer excess surplus
  to cover deficits
Return allocation results per member showing cbBefore and cbAfter.
```

**Generated output:** Correct greedy sort + transfer loop with post-allocation validation.

**Refinement:** Added edge case for `totalCb === 0` (valid but no surpluses to transfer).

---

### Example 4 — Hexagonal Architecture Scaffolding

**Prompt:**

```
Scaffold a hexagonal architecture for a Node.js TypeScript backend with:
- src/core/domain/ — entities
- src/core/application/use-cases/ — business logic
- src/core/ports/outbound/ — repository interfaces
- src/adapters/outbound/postgres/ — Prisma implementations
- src/adapters/inbound/http/ — Express controllers + routes
- src/infrastructure/server/ — DI container, Express app, entry point
No framework imports in core/. Show the file structure and key interfaces.
```

**Generated output:** Complete directory structure + interface stubs. Used directly.

---

### Example 5 — React Tab Components with Dependency Injection

**Prompt:**

```
Create a React component RoutesTab that:
- Accepts routeService: IRouteService as a prop (hexagonal inbound port)
- Fetches routes with filters (vesselType, fuelType, year)
- Shows a table with all columns from the spec
- "Set Baseline" button calls routeService.setBaseline(routeId)
- Shows compliance status (✅/❌) comparing ghgIntensity to 89.3368
- Uses TailwindCSS for styling, no external UI library
```

**Generated output:** Full component with filter state, loading/error states, optimistic UI.

---

## Validation / Corrections

### What was verified manually:

1. **CB formula math** — Computed R001–R005 CB values by hand and compared to seeded data ✅
2. **Pool allocation correctness** — Traced through greedy allocation for S1(+300)/S2(-100) case ✅
3. **API response shapes** — Checked `ok(data)` wrapper matches frontend `res.data.data!` destructuring ✅
4. **Banking over-apply guard** — Added `amount > balance.available` check after agent omitted it initially ✅
5. **CORS headers** — Verified proxy config in `vite.config.ts` forwards `/api/*` to `:3001` ✅
6. **Prisma compound unique** — Agent used `shipId_year` for `@@unique` — verified against Prisma naming convention ✅

### Corrections made:

| Issue                                       | Fix                                                        |
| ------------------------------------------- | ---------------------------------------------------------- |
| Agent omitted `express-async-errors` import | Added `import 'express-async-errors'` in `app.ts`          |
| Pool rule for zero-CB ship                  | Added explicit check: surplus ships must not exit negative |
| Frontend `cbBadge` unused export            | Kept for reuse but removed from default exports            |
| `computePercentDiff` division by zero       | Added explicit throw on baseline = 0                       |

---

## Observations

### Where agents saved time:

- **Boilerplate generation**: Prisma schema, Express route scaffolding, TypeScript interfaces — ~60% time saved
- **Test coverage**: Agent generated all unit test cases including edge cases (negative CB, over-apply, pool sum < 0) with minimal prompting
- **Documentation**: README and this workflow log were drafted by agent in ~2 minutes vs ~30 manual
- **TailwindCSS**: Component styling generated precisely from semantic prompts ("compliance surplus green, deficit red")

### Where agents failed or hallucinated:

- **Prisma `@map` vs field naming**: Agent initially mapped `ship_id` but forgot `@@map` on the model
- **Formula unit confusion**: First attempt used energy in MJ but returned result in wrong units — required explicit unit specification in prompt
- **`express-async-errors` middleware**: Agent omitted the import needed for async error propagation in Express 4
- **Pool member `id` vs `poolId`**: Agent used wrong field name in `mapPool()`, caught during code review

### How tools were combined effectively:

- Claude Code for architecture design and main implementation
- GitHub Copilot for repeat patterns (mapping functions, interface implementations)
- Claude Code for refactoring: when a component grew too large, prompted agent to extract subcomponents
- Used agent for test generation by providing the implementation file + spec as context

---

## Best Practices Followed

1. **Provided exact specification** in prompts (formula constants, endpoint signatures, business rules)
2. **Iterated on agent output** — never accepted first output without reading and validating
3. **Dependency injection in tests** — all use-case tests use injected mock repositories, not real DB
4. **Kept prompts small and focused** — one use-case per prompt, not "generate entire backend"
5. **Domain-first generation** — asked for domain entities and formulas before infrastructure
6. **Verified math manually** — CB formula computed by hand for each seed route before trusting seeded data
