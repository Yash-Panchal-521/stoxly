# SS-SS01-002 — View Cash Balance on a Simulation Portfolio

| Field        | Value                       |
| ------------ | --------------------------- |
| **Story ID** | SS-SS01-002                 |
| **Module**   | Simulation Portfolio System |
| **Sprint**   | SS-01 — Simulation Core     |
| **Priority** | Medium                      |
| **Points**   | 2                           |
| **Status**   | Done                        |

---

## User Story

> **As a** user,  
> **I want to** see my current cash balance on my simulation portfolio,  
> **so that** I know how much virtual money I have available to trade.

---

## Acceptance Criteria

### Functional

- [ ] The `GET /api/simulation/portfolio` response includes:
  - `cashBalance` — current spendable cash (decimal, 2dp display)
  - `startingCash` — original cash at portfolio creation
  - `cashUsed` — derived: `startingCash - cashBalance` (computed, not stored)
  - `cashUsedPercent` — derived: `(cashUsed / startingCash) * 100`, rounded to 1dp
- [ ] Cash balance is accurate and reflects all executed buy and sell trades.
- [ ] The simulation dashboard displays the cash balance in a dedicated card.
- [ ] Cash balance is formatted as currency (e.g. `$84,320.00` for USD).
- [ ] Cash balance updates immediately in the UI after a buy or sell trade is executed.

### Edge Cases

- [ ] A portfolio with no trades shows `cashBalance == startingCash`.
- [ ] A portfolio where all cash is deployed shows `cashBalance == 0`.
- [ ] Cash balance is never negative (enforced by SS-SS01-007).
- [ ] `GET /api/simulation/portfolio` on a `TRACKING` portfolio returns `cashBalance: null` — cash tracking is only for `SIMULATION` type.
- [ ] Requesting another user's portfolio returns `403 Forbidden`.

---

## Technical Notes

### Backend

**`GET /api/simulation/portfolio`** (new endpoint in `SimulationController`)

- Returns the authenticated user's simulation portfolio state.
- Fetch `Portfolio` record filtered by `UserId` and `PortfolioType = SIMULATION`.
- Map to a new `SimulationPortfolioResponse` DTO:

```csharp
public class SimulationPortfolioResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public decimal StartingCash { get; set; }
    public decimal CashBalance { get; set; }
    public decimal CashUsed => StartingCash - CashBalance;
    public decimal CashUsedPercent => StartingCash > 0
        ? Math.Round((CashUsed / StartingCash) * 100, 1)
        : 0;
    public string PortfolioType { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

- `cashBalance` is read directly from the `cash_balance` column — it is updated atomically during trade execution (SS-SS01-005 / SS-SS01-006), not recalculated on read.

**No new service logic required** — this is a read-only operation pulling from the `Portfolio` table.

### Frontend

**New component: `CashBalanceCard.tsx`** (under `src/features/portfolios/`)

- Displays `cashBalance`, `startingCash`, and a progress bar for `cashUsedPercent`.
- Uses `text-text-primary` for balance value, `text-text-secondary` for label.
- Applies `stoxly-card` utility class.

**`portfolio-service.ts`**

- Add `getSimulationPortfolio(): Promise<SimulationPortfolioResponse>` calling `GET /api/simulation/portfolio`.

**New hook: `use-simulation-portfolio.ts`**

```typescript
export function useSimulationPortfolio() {
  return useQuery({
    queryKey: ["simulation", "portfolio"],
    queryFn: getSimulationPortfolio,
    staleTime: 30_000,
  });
}
```

**`types/portfolio.ts`**

- Add `SimulationPortfolioResponse` type with `cashBalance`, `startingCash`, `cashUsed`, `cashUsedPercent`.

---

## Dependencies

| Dependency                 | Type         | Notes                                                                  |
| -------------------------- | ------------ | ---------------------------------------------------------------------- |
| SS-SS01-001                | Blocking     | Portfolio must exist with `cashBalance` column before this can be read |
| Existing `Portfolio` model | Code — reuse | `cashBalance` field added in SS-SS01-001 migration                     |

---

## Out of Scope

- Multi-currency cash balances (Sprint 1 is USD only)
- Real-time SignalR push for cash balance changes (Sprint 2)
- Cash balance history / chart over time
