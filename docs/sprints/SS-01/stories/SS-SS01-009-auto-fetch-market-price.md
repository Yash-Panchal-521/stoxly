# SS-SS01-009 — Auto-Fetch Current Market Price at Trade Execution

| Field        | Value                   |
| ------------ | ----------------------- |
| **Story ID** | SS-SS01-009             |
| **Module**   | Virtual Trading Engine  |
| **Sprint**   | SS-01 — Simulation Core |
| **Priority** | High                    |
| **Points**   | 3                       |
| **Status**   | Done                    |

---

## User Story

> **As a** user,  
> **I want** every simulated trade to execute at the actual current market price,  
> **so that** my simulation reflects realistic market conditions and I cannot manipulate trade prices.

---

## Acceptance Criteria

### Functional

- [ ] Trade execution endpoints (`/api/simulation/buy`, `/api/simulation/sell`) do **not accept a `price` field** in the request body — price is always server-determined.
- [ ] The server fetches the current price for the symbol from `IMarketPriceService` at the moment of execution.
- [ ] The fetched price is stored as-is on the `Transaction` record (`price` column).
- [ ] The fetched price is returned in the `SimulationTradeResponse.price` field.
- [ ] The price used comes from **Redis cache first** (TTL 60s); if cache misses, falls back to **Finnhub API**.
- [ ] A live price preview is shown in the frontend trade form, updating as the user types a symbol.
- [ ] The price shown in the confirmation dialog is a snapshot at the time the dialog was opened — it does not update while the dialog is open.
- [ ] The confirmation dialog includes a disclaimer: `"Price may vary slightly at execution."`
- [ ] After execution, the `SimulationTradeResponse` includes the exact price used so the UI can display the confirmed execution price.

### Edge Cases

- [ ] If `IMarketPriceService` returns `null` (symbol unknown or no data available), the trade is rejected with `400 Bad Request`: `"Price unavailable for symbol {symbol}. Cannot execute trade."`
- [ ] If `price = 0` is returned from the market service, the trade is rejected (treat as unavailable).
- [ ] Market price is fetched exactly **once** per trade execution — it is not re-fetched between validation and DB write steps.
- [ ] Stale Redis cache (within 60s TTL) is acceptable — the simulation does not require tick-level precision.
- [ ] Symbol is normalised to UPPERCASE before the price lookup.

---

## Technical Notes

### Backend

**`IMarketPriceService`** — Already implemented. Methods available:

```csharp
Task<decimal?> GetPriceAsync(string symbol);
```

Implementation `LiveMarketPriceService`:

1. Check Redis key `price:{SYMBOL}` — return cached value if present (TTL 60s).
2. On cache miss: call Finnhub quote API, cache result, return price.

**Usage in `SimulationTradeService`** (both buy and sell flows):

```csharp
var price = await _marketPriceService.GetPriceAsync(symbol.ToUpperInvariant());

if (price == null || price <= 0)
    throw new PriceUnavailableException(symbol);
```

**New exception — `PriceUnavailableException.cs`**

```csharp
public class PriceUnavailableException : Exception
{
    public string Symbol { get; }

    public PriceUnavailableException(string symbol)
        : base($"Price unavailable for symbol {symbol}. Cannot execute trade.")
    {
        Symbol = symbol;
    }
}
```

**Global exception handler**

- Map `PriceUnavailableException` → `400 Bad Request`:

```json
{
  "error": "PriceUnavailable",
  "message": "Price unavailable for symbol XXXX. Cannot execute trade."
}
```

**Key design decision: price fetched once, stored on Transaction**

- Price is fetched once in the service method before the DB transaction begins.
- It is passed into the `Transaction` record and not re-queried inside the DB transaction.
- This avoids external HTTP calls inside a DB transaction, which could hold locks.

### Frontend

**Live price preview in `SimulationTradeForm.tsx`**

- Uses existing `useStockDetail(symbol)` hook (or `use-price-socket.ts` for real-time SignalR price).
- Shows: `Current Price: $XXX.XX` below the symbol search, updated when symbol changes.
- Displays last-updated timestamp: `"as of HH:MM:SS"`.

**Price snapshot in `OrderConfirmationDialog.tsx`**

- Captures `currentPrice` at the time the dialog is opened (snapshot, not live-updating).
- Displays: `"Execution Price: ~$XXX.XX"`.
- Includes disclaimer line: `"Price may vary slightly at execution."` using `text-text-secondary text-small`.

**Handling `PriceUnavailable` error in the mutation**

- Show as inline form error: `"Price is currently unavailable for this symbol. Try again shortly."`
- Do not treat as generic error toast.

---

## Dependencies

| Dependency                                                | Type                   | Notes                                                                  |
| --------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| SS-SS01-005                                               | Blocking               | Price fetch is part of `ExecuteBuyAsync` flow                          |
| SS-SS01-006                                               | Blocking               | Price fetch is part of `ExecuteSellAsync` flow                         |
| Existing `IMarketPriceService` / `LiveMarketPriceService` | Code — reuse           | No changes to price service needed                                     |
| Existing Redis caching (60s TTL)                          | Infrastructure — reuse | Already configured in `PriceUpdateWorker` and `LiveMarketPriceService` |
| Existing `use-stock-detail.ts`                            | Code — reuse           | Provides live price preview for the frontend trade form                |

---

## Out of Scope

- User-supplied price entry for simulated trades (intentionally blocked — simulation must use real prices)
- Tick-level real-time price updates within the trade form (30s/60s refresh is acceptable in Sprint 1)
- Historical price trades (e.g. "buy at yesterday's closing price") — future feature
- Slippage simulation
