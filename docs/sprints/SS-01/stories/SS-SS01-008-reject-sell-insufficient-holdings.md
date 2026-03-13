# SS-SS01-008 — Reject a Sell Order That Exceeds Held Position

| Field        | Value                   |
| ------------ | ----------------------- |
| **Story ID** | SS-SS01-008             |
| **Module**   | Virtual Trading Engine  |
| **Sprint**   | SS-01 — Simulation Core |
| **Priority** | High                    |
| **Points**   | 2                       |
| **Status**   | To Do                   |

---

## User Story

> **As a** user,  
> **I want** the system to prevent me from selling more shares than I hold,  
> **so that** my simulation portfolio stays consistent and short selling is not accidentally possible.

---

## Acceptance Criteria

### Functional

- [ ] When a sell order `quantity` exceeds the available held quantity for that symbol, the trade is rejected.
- [ ] The API returns `400 Bad Request` with the error body:
  ```json
  {
    "error": "InsufficientHoldings",
    "message": "Insufficient holdings. Requested: X. Available: Y."
  }
  ```
- [ ] The rejection message includes both the requested quantity and the available quantity.
- [ ] No `Transaction` record is created on rejection.
- [ ] `portfolio.cashBalance` is **not modified** on rejection.
- [ ] If the user holds **zero** shares of a symbol, attempting to sell any quantity returns the same `400` with `Available: 0`.
- [ ] The frontend pre-emptively disables the "Review Order" button if entered quantity exceeds held quantity (client-side guard).
- [ ] A "Sell All" shortcut pre-fills the quantity field with the full held quantity.

### Edge Cases

- [ ] Selling exactly the held quantity (full close) is **accepted**.
- [ ] Selling `0.001` more than held is rejected.
- [ ] Race condition: concurrent sell orders that together exceed holdings — the second request fails after the first commits (same DB transaction concurrency pattern as SS-SS01-007).
- [ ] Symbol held in a different portfolio does not count toward available quantity — validation is per-portfolio.
- [ ] Holdings are calculated from non-deleted transactions only (soft-deleted transactions from a reset are excluded).

---

## Technical Notes

### Backend

**Context: partial implementation already exists**  
The existing `TransactionService.CreateAsync` checks holdings via `FifoEngine` for SELL transactions on the general `/api/portfolios/{id}/transactions` endpoint. This story **formalises and reuses** that logic inside `SimulationTradeService.ExecuteSellAsync` (from SS-SS01-006), ensuring it is applied specifically to simulation trades.

**`SimulationTradeService.ExecuteSellAsync`** — Steps 3–4 from SS-SS01-006:

```csharp
// Step 3: calculate available quantity via FifoEngine
var transactions = await _transactionRepository
    .GetByPortfolioAndSymbolAsync(portfolioId, symbol);
var remainingLots = _fifoEngine.CalculateRemainingLots(transactions);
var availableQuantity = remainingLots.Sum(lot => lot.RemainingQuantity);

// Step 4: validate
if (availableQuantity < quantity)
{
    throw new InsufficientHoldingsException(
        requested: quantity,
        available: availableQuantity,
        symbol: symbol
    );
}
```

**New exception — `InsufficientHoldingsException.cs`**

```csharp
public class InsufficientHoldingsException : Exception
{
    public string Symbol { get; }
    public decimal Requested { get; }
    public decimal Available { get; }

    public InsufficientHoldingsException(string symbol, decimal requested, decimal available)
        : base($"Insufficient holdings for {symbol}. Requested: {requested}. Available: {available}.")
    {
        Symbol = symbol;
        Requested = requested;
        Available = available;
    }
}
```

**Global exception handler / Middleware**

- Map `InsufficientHoldingsException` → `400 Bad Request` with structured error body.
- Register alongside `InsufficientCashException` mapping (SS-SS01-007).

**`ITransactionRepository`**

- Add `GetByPortfolioAndSymbolAsync(Guid portfolioId, string symbol)` if not already present (check existing repo — may already exist in general transaction listing with filtering).

**`IFifoEngine.CalculateRemainingLots`**

- Already implemented in `FifoEngine.cs`. No changes required.

### Frontend

**`SimulationTradeForm.tsx`**

- When side is `SELL`:
  - Fetch `useHoldings(portfolioId)` to get holdings per symbol.
  - Find holding for selected symbol; extract `quantity` as `maxSellQuantity`.
  - If `enteredQuantity > maxSellQuantity`, disable "Review Order" button.
  - Show inline: `"You hold X shares of {symbol}."` below the quantity input.
  - Show `text-danger` warning if over-quantity: `"Cannot sell more than X shares."`

**"Sell All" shortcut**

- Small `"Sell All"` link/button next to the quantity field.
- On click: sets quantity input to `maxSellQuantity`.

**`OrderConfirmationDialog.tsx`**

- On API error with code `InsufficientHoldings`: close dialog and show inline error in the form.

---

## Dependencies

| Dependency                         | Type                   | Notes                                         |
| ---------------------------------- | ---------------------- | --------------------------------------------- |
| SS-SS01-006                        | Blocking               | Validation runs inside `ExecuteSellAsync`     |
| SS-SS01-001                        | Blocking               | Portfolio must be `SIMULATION` type           |
| Existing `IFifoEngine`             | Code — reuse           | `CalculateRemainingLots()` used as-is         |
| Existing `ITransactionRepository`  | Code — possibly extend | May need `GetByPortfolioAndSymbolAsync` added |
| Existing error handling middleware | Code — extend          | Map `InsufficientHoldingsException` to 400    |

---

## Out of Scope

- Short selling
- Hedging with options (out of scope for entire platform)
- Position limits per symbol
- Warning thresholds (e.g. selling > 50% of a position)
