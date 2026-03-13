# SS-SS01-007 — Reject a Buy Order That Exceeds Cash Balance

| Field        | Value                   |
| ------------ | ----------------------- |
| **Story ID** | SS-SS01-007             |
| **Module**   | Virtual Trading Engine  |
| **Sprint**   | SS-01 — Simulation Core |
| **Priority** | High                    |
| **Points**   | 2                       |
| **Status**   | Done                    |

---

## User Story

> **As a** user,  
> **I want** the system to prevent me from buying more than I can afford with my virtual cash,  
> **so that** my simulation portfolio remains financially consistent and cash balance never goes negative.

---

## Acceptance Criteria

### Functional

- [ ] When a buy order cost (`quantity × currentPrice`) exceeds `portfolio.cashBalance`, the trade is rejected.
- [ ] The API returns `400 Bad Request` with the error body:
  ```json
  {
    "error": "InsufficientCash",
    "message": "Insufficient cash. Required: $X,XXX.XX. Available: $X,XXX.XX."
  }
  ```
- [ ] The rejection includes both the required amount and the available balance in the error message.
- [ ] No `Transaction` record is created on rejection.
- [ ] `portfolio.cashBalance` is **not modified** on rejection.
- [ ] The frontend displays the error message inline in the trade form (not a generic toast).
- [ ] The trade form pre-emptively disables the "Review Order" button if the estimated cost already exceeds available cash (client-side guard).

### Edge Cases

- [ ] Order cost exactly equal to `cashBalance` is **accepted** (boundary condition: `cost == cashBalance` is valid).
- [ ] Race condition: if two concurrent buy orders are both validated as sufficient but together would exceed the balance, the DB transaction's concurrency check (from SS-SS01-005) ensures only one succeeds; the second returns `400 InsufficientCash`.
- [ ] `currentPrice` changed between the "Review Order" preview and the confirmation submit — the server-side price is authoritative; the validation uses the price fetched at execution time, not the client-submitted price.
- [ ] `cashBalance = 0` always rejects any buy order with `quantity > 0`.

---

## Technical Notes

### Backend

**`SimulationTradeService.ExecuteBuyAsync`**

- Validation step (step 4 from SS-SS01-005):

```csharp
var totalCost = quantity * currentPrice;
if (portfolio.CashBalance < totalCost)
{
    throw new InsufficientCashException(
        required: totalCost,
        available: portfolio.CashBalance
    );
}
```

**New exception — `InsufficientCashException.cs`**

```csharp
public class InsufficientCashException : Exception
{
    public decimal Required { get; }
    public decimal Available { get; }

    public InsufficientCashException(decimal required, decimal available)
        : base($"Insufficient cash. Required: {required:C}. Available: {available:C}.")
    {
        Required = required;
        Available = available;
    }
}
```

**Global exception handler / Middleware**

- Map `InsufficientCashException` → `400 Bad Request` with structured error body:

```json
{
  "error": "InsufficientCash",
  "message": "Insufficient cash. Required: $1,500.00. Available: $320.00."
}
```

- Register in existing error handling middleware (check `Middleware/` folder for existing pattern).

### Frontend

**`SimulationTradeForm.tsx`**

- Compute `estimatedCost = quantity × livePrice` reactively.
- Compare against `cashBalance` from `useSimulationPortfolio()`.
- Disable "Review Order" button and show inline warning: `"Estimated cost ($X,XXX.XX) exceeds your available cash ($X,XXX.XX)."` when `estimatedCost > cashBalance`.
- Use `text-danger` colour for the warning text.

**`OrderConfirmationDialog.tsx`**

- On API error with code `InsufficientCash`: close dialog and show inline error in the form (not a toast).

**Error handling in mutation**

```typescript
onError: (error) => {
  if (error.code === "InsufficientCash") {
    setFormError(error.message);
  }
};
```

---

## Dependencies

| Dependency                         | Type            | Notes                                                                        |
| ---------------------------------- | --------------- | ---------------------------------------------------------------------------- |
| SS-SS01-005                        | Blocking        | This validation is called inside `ExecuteBuyAsync` before trade creation     |
| SS-SS01-001                        | Blocking        | `cashBalance` column must exist                                              |
| SS-SS01-002                        | Soft dependency | `useSimulationPortfolio()` hook provides `cashBalance` for client-side guard |
| Existing error handling middleware | Code — extend   | Map new exception type to 400 response                                       |

---

## Out of Scope

- Margin trading / leverage (simulation is cash-only)
- Warnings at a configurable threshold (e.g. "80% of cash used") — future feature
- Credit or borrow mechanics
