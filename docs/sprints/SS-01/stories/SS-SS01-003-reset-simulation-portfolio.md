# SS-SS01-003 — Reset a Simulation Portfolio to Its Starting State

| Field        | Value                       |
| ------------ | --------------------------- |
| **Story ID** | SS-SS01-003                 |
| **Module**   | Simulation Portfolio System |
| **Sprint**   | SS-01 — Simulation Core     |
| **Priority** | Medium                      |
| **Points**   | 3                           |
| **Status**   | To Do                       |

---

## User Story

> **As a** user,  
> **I want to** reset my simulation portfolio back to its original starting state,  
> **so that** I can start over with fresh virtual capital without creating a new portfolio.

---

## Acceptance Criteria

### Functional

- [ ] `POST /api/simulation/reset` resets the authenticated user's simulation portfolio.
- [ ] On reset:
  - All transactions for this portfolio are **soft-deleted** (`deleted_at` set to current timestamp).
  - `cashBalance` is restored to `startingCash`.
  - `updatedAt` is updated on the portfolio record.
- [ ] The API returns a `200 OK` response with the refreshed `SimulationPortfolioResponse`.
- [ ] The reset is **irreversible** — soft-deleted transactions cannot be recovered by the user.
- [ ] The frontend shows a confirmation dialog before calling the reset endpoint.
- [ ] After reset, the portfolio list, holdings table, and cash balance card all reflect the cleared state.

### Edge Cases

- [ ] Resetting a portfolio with no trades succeeds (no-op on transactions, cash remains at starting value).
- [ ] Reset on a `TRACKING` portfolio returns `400 Bad Request` with message `"Reset is only available for simulation portfolios."`.
- [ ] Resetting another user's portfolio returns `403 Forbidden`.
- [ ] If the reset operation fails mid-way (e.g. DB error), the transaction is rolled back — no partial state.
- [ ] Concurrent reset calls (double-click) are idempotent — second call returns `200 OK` with same clean state.

---

## Technical Notes

### Backend

**New endpoint — `SimulationController.cs`**

```
POST /api/simulation/reset
```

- Authenticates user via `[FirebaseAuthorize]`.
- Fetches the user's simulation portfolio; returns `400` if type is not `SIMULATION`, `404` if none found.
- Runs the following inside a **database transaction** (`IDbContextTransaction`):
  1. Soft-deletes all `Transaction` records where `PortfolioId == portfolio.Id` and `DeletedAt IS NULL`.
  2. Sets `portfolio.CashBalance = portfolio.StartingCash`.
  3. Sets `portfolio.UpdatedAt = DateTime.UtcNow`.
  4. Saves changes.
- Returns mapped `SimulationPortfolioResponse`.

**Service — `ISimulationPortfolioService`**

- New method: `Task<SimulationPortfolioResponse> ResetAsync(Guid portfolioId, string userId)`
- Wrap the two-step operation (soft-delete + cash restore) in an EF Core `BeginTransactionAsync` block.

**Repository — `ITransactionRepository`**

- Add: `Task SoftDeleteAllByPortfolioAsync(Guid portfolioId)` — bulk-sets `deleted_at = now()` for all non-deleted transactions of the given portfolio.

### Frontend

**New component: `ResetPortfolioDialog.tsx`** (under `src/features/portfolios/`)

- Confirmation dialog with warning text: `"This will erase all trades and restore your cash to $X. This cannot be undone."`
- Shows `startingCash` value in the warning message.
- On confirm: calls `resetSimulationPortfolio()` service function.
- On success: invalidates TanStack Query keys `["simulation", "portfolio"]`, `["portfolios", portfolioId, "holdings"]`, `["portfolios", portfolioId, "transactions"]`.

**`portfolio-service.ts`**

- Add `resetSimulationPortfolio(): Promise<SimulationPortfolioResponse>` calling `POST /api/simulation/reset`.

**Mutation hook (inline in dialog or extracted):**

```typescript
const { mutate: reset, isPending } = useMutation({
  mutationFn: resetSimulationPortfolio,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["simulation", "portfolio"] });
    queryClient.invalidateQueries({ queryKey: ["portfolios"] });
  },
});
```

---

## Dependencies

| Dependency                        | Type            | Notes                                                               |
| --------------------------------- | --------------- | ------------------------------------------------------------------- |
| SS-SS01-001                       | Blocking        | Portfolio must have `startingCash` and `cashBalance` columns        |
| SS-SS01-002                       | Soft dependency | `use-simulation-portfolio` hook reused to refresh state after reset |
| Existing `ITransactionRepository` | Code — extend   | Add `SoftDeleteAllByPortfolioAsync` method                          |
| Existing soft-delete pattern      | Code — reuse    | `DeletedAt` pattern already established in `Transaction.cs`         |

---

## Out of Scope

- Hard-deleting transactions (soft-delete only in Sprint 1)
- Selective reset (resetting only a date range of trades)
- Reset history / audit log
- Scheduled auto-reset (future feature)
