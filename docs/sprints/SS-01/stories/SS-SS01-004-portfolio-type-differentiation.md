# SS-SS01-004 — Differentiate Simulation vs. Tracking Portfolios

| Field        | Value                       |
| ------------ | --------------------------- |
| **Story ID** | SS-SS01-004                 |
| **Module**   | Simulation Portfolio System |
| **Sprint**   | SS-01 — Simulation Core     |
| **Priority** | Low                         |
| **Points**   | 2                           |
| **Status**   | To Do                       |

---

## User Story

> **As a** user,  
> **I want** my simulation and tracking portfolios to be visually and functionally distinct,  
> **so that** I never confuse virtual trades with real investment records.

---

## Acceptance Criteria

### Functional

- [ ] The `PortfolioResponse` from `GET /api/portfolios` includes a `portfolioType` field (`SIMULATION` or `TRACKING`).
- [ ] The portfolio list in the UI renders a distinct badge or label for each type (e.g. `Sim` chip for simulation, no badge or `Live` for tracking).
- [ ] Simulation-only API actions (`/api/simulation/buy`, `/api/simulation/sell`, `/api/simulation/reset`) return `400 Bad Request` if the target portfolio is not of type `SIMULATION`.
- [ ] Tracking portfolios do not expose `cashBalance` or `startingCash` (returned as `null`).
- [ ] Existing portfolios created before SS-SS01-001 migration default to `portfolioType = TRACKING`.
- [ ] When creating a portfolio via `POST /api/portfolios` (general endpoint), `portfolioType` defaults to `TRACKING` if not supplied.

### Edge Cases

- [ ] Attempting to pass `portfolioType = SIMULATION` to the general `POST /api/portfolios` endpoint is accepted and treated the same as creating via `POST /api/simulation/portfolio` (or rejected with `400` — choose one approach, document the decision).
- [ ] A `TRACKING` portfolio does not show a "Reset" button in the UI.
- [ ] A `SIMULATION` portfolio does not show manual price entry (price always auto-fetched — SS-SS01-009).

---

## Technical Notes

### Backend

**`Portfolio.cs`**

- Add `PortfolioType` enum (C# enum or string-backed):

```csharp
public enum PortfolioType
{
    Tracking,
    Simulation
}
```

- Default value: `Tracking` (migration default `'TRACKING'`).

**EF Core migration** (part of `AddSimulationFieldsToPortfolio` from SS-SS01-001):

- Column: `portfolio_type varchar(20) NOT NULL DEFAULT 'TRACKING'`
- All existing rows automatically backfilled to `TRACKING`.

**`PortfolioResponse` DTO**

- Add `PortfolioType portfolioType` field.
- Add `decimal? StartingCash` and `decimal? CashBalance` (nullable, only populated for `SIMULATION`).

**Validation guard — Applied in `SimulationController`**

```csharp
if (portfolio.PortfolioType != PortfolioType.Simulation)
    return BadRequest("This action is only available for simulation portfolios.");
```

### Frontend

**Portfolio list / sidebar**

- Show a `SIMULATION` badge using `.trend-neutral` or a custom `bg-primary/10 text-primary` pill.
- Tracking portfolios show no badge (or a subtle `TRACKING` label).

**`types/portfolio.ts`**

- Add `portfolioType: 'SIMULATION' | 'TRACKING'` to `PortfolioResponse`.
- Add `startingCash: number | null` and `cashBalance: number | null`.

**`HoldingsTable.tsx` / dashboard layouts**

- Conditionally render simulation-specific UI (cash balance card, reset button) based on `portfolioType === 'SIMULATION'`.

**Design token guidance**

- Simulation badge: `bg-primary/10 text-primary text-small rounded-xl px-2 py-0.5`
- Tracking badge (if shown): `bg-surface text-text-secondary text-small rounded-xl px-2 py-0.5 border border-border`

---

## Dependencies

| Dependency                       | Type          | Notes                                                  |
| -------------------------------- | ------------- | ------------------------------------------------------ |
| SS-SS01-001                      | Blocking      | `portfolioType` column added in that story's migration |
| Existing `PortfolioResponse` DTO | Code — extend | Add `portfolioType` field                              |
| Existing portfolio list UI       | Code — extend | Add badge rendering logic                              |

---

## Out of Scope

- Portfolio type editing after creation (type is immutable)
- A separate dedicated page/route for simulation vs. tracking
- "Paper trading mode" toggle (type is set at portfolio creation only)
