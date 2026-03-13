# SS-SS01-005 — Execute a Market Buy Order at Current Price

| Field        | Value                   |
| ------------ | ----------------------- |
| **Story ID** | SS-SS01-005             |
| **Module**   | Virtual Trading Engine  |
| **Sprint**   | SS-01 — Simulation Core |
| **Priority** | High                    |
| **Points**   | 5                       |
| **Status**   | To Do                   |

---

## User Story

> **As a** user,  
> **I want to** buy shares of a stock at the current market price using my virtual cash,  
> **so that** I can simulate an investment and track its performance.

---

## Acceptance Criteria

### Functional

- [ ] `POST /api/simulation/buy` accepts:
  - `portfolioId` (Guid, required)
  - `symbol` (string, required, e.g. `"AAPL"`)
  - `quantity` (decimal, required, > 0)
  - `notes` (string, optional, max 500 chars)
- [ ] The system **auto-fetches** the current market price for the symbol at execution time (user does not supply price).
- [ ] Trade executes instantly as a market order.
- [ ] A `Transaction` record is created with:
  - `type = BUY`
  - `symbol` normalised to UPPERCASE
  - `price` = auto-fetched current price
  - `quantity` = requested quantity
  - `executedAt` = `DateTime.UtcNow`
  - `fee = 0` (no commission in simulation)
- [ ] `portfolio.cashBalance` is decremented by `quantity × price` atomically in the same DB transaction.
- [ ] The response returns the created `SimulationTradeResponse` DTO with all trade fields plus `remainingCashBalance`.
- [ ] The UI shows an order confirmation summary before the trade is placed (see SS-SS01-005 UI notes).
- [ ] After confirmation, the holdings table and cash balance card update in the UI.

### Edge Cases

- [ ] `quantity ≤ 0` returns `400 Bad Request`: `"Quantity must be greater than zero."`
- [ ] `symbol` not found in market data returns `400 Bad Request`: `"Symbol not found or price unavailable."`
- [ ] Insufficient cash returns `400 Bad Request` (enforced by SS-SS01-007, called before this story's service proceeds).
- [ ] Portfolio not found or not owned by user returns `404 Not Found` / `403 Forbidden`.
- [ ] Portfolio type is not `SIMULATION` returns `400 Bad Request`.
- [ ] Fractional quantities are supported (e.g. `quantity = 0.5` for high-priced stocks).
- [ ] Concurrent buy requests for the same portfolio use optimistic concurrency or pessimistic locking to prevent overshooting cash balance.

---

## Technical Notes

### Backend

**New endpoint — `SimulationController.cs`**

```
POST /api/simulation/buy
```

- `[FirebaseAuthorize]`, `[HttpPost("buy")]`
- Validates request DTO.
- Delegates to `ISimulationTradeService.ExecuteBuyAsync(...)`.
- Returns `201 Created` with `SimulationTradeResponse`.

**New service — `ISimulationTradeService` / `SimulationTradeService`**

```csharp
Task<SimulationTradeResponse> ExecuteBuyAsync(
    Guid portfolioId,
    string userId,
    string symbol,
    decimal quantity,
    string? notes
);
```

Steps inside `ExecuteBuyAsync`:

1. Load portfolio; validate ownership and `PortfolioType == Simulation`.
2. Fetch current price via `IMarketPriceService.GetPriceAsync(symbol)`.
3. Calculate `totalCost = quantity × price`.
4. Validate `portfolio.CashBalance >= totalCost` (throw `InsufficientCashException` if not).
5. Inside `IDbContextTransaction`:
   - Create `Transaction` record (`BUY`, price, quantity, fee=0, notes).
   - Decrement `portfolio.CashBalance -= totalCost`.
   - Save changes.
6. Return `SimulationTradeResponse`.

**New DTO — `SimulationTradeRequest` / `SimulationTradeResponse`**

```csharp
// Request
public class SimulationBuyRequest
{
    public Guid PortfolioId { get; set; }
    public string Symbol { get; set; }          // normalised to UPPER in service
    public decimal Quantity { get; set; }
    public string? Notes { get; set; }
}

// Response
public class SimulationTradeResponse
{
    public Guid TransactionId { get; set; }
    public string Symbol { get; set; }
    public string Side { get; set; }           // "BUY" | "SELL"
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Total { get; set; }         // quantity × price
    public decimal Fee { get; set; }
    public DateTime ExecutedAt { get; set; }
    public decimal RemainingCashBalance { get; set; }
    public string? Notes { get; set; }
}
```

**Concurrency**

- Use EF Core row version / `IsConcurrencyToken` on `Portfolio.CashBalance`, or wrap in `SELECT FOR UPDATE` via raw SQL if optimistic concurrency causes too many retries.

### Frontend

**New component: `SimulationTradeForm.tsx`** (under `src/features/transactions/`)

- Fields: stock symbol search, quantity input.
- Live price preview fetched from `useStockDetail(symbol)`.
- Shows estimated cost: `quantity × currentPrice`.
- Shows available cash: from `useSimulationPortfolio()`.
- "Review Order" button opens an `OrderConfirmationDialog`.

**New component: `OrderConfirmationDialog.tsx`** (under `src/features/transactions/`)

- Shows: Symbol, Side (BUY), Quantity, Price, Total Cost, Remaining Cash after trade.
- "Confirm" button submits `POST /api/simulation/buy`.
- On success: invalidates `["simulation", "portfolio"]`, `["portfolios", portfolioId, "holdings"]`, `["portfolios", portfolioId, "transactions"]`.

**`transaction-service.ts`**

- Add `simulationBuy(request: SimulationBuyRequest): Promise<SimulationTradeResponse>`.

**New hook: `use-simulation-trade.ts`**

```typescript
export function useSimulationBuy() {
  return useMutation({
    mutationFn: simulationBuy,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["simulation", "portfolio"] });
      queryClient.invalidateQueries({
        queryKey: ["portfolios", variables.portfolioId, "holdings"],
      });
    },
  });
}
```

---

## Dependencies

| Dependency                        | Type         | Notes                                                                   |
| --------------------------------- | ------------ | ----------------------------------------------------------------------- |
| SS-SS01-001                       | Blocking     | `cashBalance` column required                                           |
| SS-SS01-004                       | Blocking     | Portfolio type guard required                                           |
| SS-SS01-007                       | Blocking     | Cash validation fires before this story's trade logic                   |
| SS-SS01-009                       | Blocking     | Auto-price-fetch is integral to this flow                               |
| Existing `IMarketPriceService`    | Code — reuse | `GetPriceAsync(symbol)` already implemented in `LiveMarketPriceService` |
| Existing `ITransactionRepository` | Code — reuse | `CreateAsync(transaction)` already exists                               |
| Existing `FifoEngine`             | Code — reuse | Used downstream for holdings calculation (Sprint 2)                     |

---

## Out of Scope

- Limit orders (future sprint)
- Commission / fee simulation
- Partial fill simulation
- Pre-market / after-hours restrictions
