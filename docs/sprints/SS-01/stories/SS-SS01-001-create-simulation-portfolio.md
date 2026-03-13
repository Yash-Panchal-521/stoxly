# SS-SS01-001 — Create a Simulation Portfolio with Virtual Cash

| Field        | Value                       |
| ------------ | --------------------------- |
| **Story ID** | SS-SS01-001                 |
| **Module**   | Simulation Portfolio System |
| **Sprint**   | SS-01 — Simulation Core     |
| **Priority** | High                        |
| **Points**   | 3                           |
| **Status**   | To Do                       |

---

## User Story

> **As a** user,  
> **I want to** create a simulation portfolio with a chosen starting cash amount,  
> **so that** I can practice trading with virtual money without risking real capital.

---

## Acceptance Criteria

### Functional

- [ ] User can create a new portfolio by providing:
  - `name` (required, 1–120 characters)
  - `startingCash` (required, positive decimal, e.g. `100000.00`)
  - `description` (optional)
- [ ] The portfolio is persisted with `portfolioType = SIMULATION`.
- [ ] `cashBalance` is initialised equal to `startingCash` at creation time.
- [ ] `startingCash` is immutable after creation (reset uses this value — see SS-SS01-003).
- [ ] The newly created portfolio is returned in the API response with fields:
  - `id`, `name`, `description`, `portfolioType`, `startingCash`, `cashBalance`, `createdAt`
- [ ] A user can have at most **20 portfolios** in total (existing system cap enforced).
- [ ] The portfolio appears in the user's portfolio list on the frontend after creation.

### Edge Cases

- [ ] `startingCash` of `0` is **rejected** with a `400 Bad Request` and message `"Starting cash must be greater than zero."`.
- [ ] `startingCash` above `10,000,000` is **rejected** with a `400 Bad Request` — maximum virtual cash cap.
- [ ] Missing `name` returns `400 Bad Request`.
- [ ] Creating a portfolio when the 20-portfolio cap is already reached returns `409 Conflict`.
- [ ] `portfolioType` cannot be set to anything other than `SIMULATION` via this endpoint.

---

## Technical Notes

### Backend

**Model changes — `Portfolio.cs`**

- Add `PortfolioType` enum property: `SIMULATION | TRACKING` (default `TRACKING` for existing records).
- Add `StartingCash` column (`decimal(18,4)`, nullable for `TRACKING` portfolios).
- Add `CashBalance` column (`decimal(18,4)`, nullable for `TRACKING` portfolios).

**Migration**

- New EF Core migration: `AddSimulationFieldsToPortfolio`
  - Adds `portfolio_type` (`varchar(20)`, default `'TRACKING'`)
  - Adds `starting_cash` (`numeric(18,4)`, nullable)
  - Adds `cash_balance` (`numeric(18,4)`, nullable)

**DTO changes — `PortfolioDto.cs`**

- Extend `CreatePortfolioRequest` to include `StartingCash` (`decimal?`) with `[Range(0.01, 10_000_000)]` validation.
- Extend `PortfolioResponse` to include `PortfolioType`, `StartingCash`, `CashBalance`.

**New endpoint — `SimulationController.cs`**

```
POST /api/simulation/portfolio
```

- Validates `StartingCash > 0`.
- Sets `PortfolioType = SIMULATION`, `CashBalance = StartingCash`.
- Delegates to `IPortfolioService.CreateAsync(...)` (or new `ISimulationPortfolioService`).
- Returns `201 Created` with `PortfolioResponse`.

**Service — `PortfolioService.cs`**

- No business logic change required; mapping layer handles the new fields.
- Enforce the new fields are populated when `PortfolioType == SIMULATION`.

### Frontend

**`CreatePortfolioModal.tsx`**

- Add a `Portfolio Type` toggle/select: `Simulation` | `Tracking` (default `Simulation` for new users).
- When `Simulation` is selected, show a `Starting Cash` number input (default `100,000`).
- Validate `startingCash` > 0 on the client before submission.

**`portfolio-service.ts`**

- Update `createPortfolio(...)` to send `portfolioType` and `startingCash` in the request body.

**`types/portfolio.ts`**

- Add `portfolioType: 'SIMULATION' | 'TRACKING'` to `PortfolioResponse`.
- Add `startingCash: number` and `cashBalance: number` to `PortfolioResponse`.
- Add `startingCash?: number` and `portfolioType?: string` to `CreatePortfolioRequest`.

---

## Dependencies

| Dependency                                         | Type          | Notes                                         |
| -------------------------------------------------- | ------------- | --------------------------------------------- |
| Existing `Portfolio` model                         | Code — reuse  | Extended, not replaced                        |
| Existing `IPortfolioRepository`                    | Code — reuse  | No change needed                              |
| Existing `CreatePortfolioModal.tsx`                | Code — extend | Add type + cash fields                        |
| EF Core migration `AddSimulationFieldsToPortfolio` | Blocking      | Must run before any simulation endpoints work |

---

## Out of Scope

- Limit order support (future sprint)
- Tracking portfolio creation changes (covered by SS-SS01-004)
- Portfolio sharing or multi-user portfolios
- Currency selection for simulation (USD only in Sprint 1)
