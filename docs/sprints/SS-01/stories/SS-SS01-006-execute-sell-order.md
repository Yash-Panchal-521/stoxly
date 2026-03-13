# SS-SS01-006 — Execute a Market Sell Order on a Held Position

| Field        | Value                   |
| ------------ | ----------------------- |
| **Story ID** | SS-SS01-006             |
| **Module**   | Virtual Trading Engine  |
| **Sprint**   | SS-01 — Simulation Core |
| **Priority** | High                    |
| **Points**   | 5                       |
| **Status**   | To Do                   |

---

## User Story

> **As a** user,  
> **I want to** sell shares of a stock I currently hold at the current market price,  
> **so that** I can realise a profit or cut a loss and free up virtual cash.

---

## Acceptance Criteria

### Functional

- [ ] `POST /api/simulation/sell` accepts:
  - `portfolioId` (Guid, required)
  - `symbol` (string, required)
  - `quantity` (decimal, required, > 0)
  - `notes` (string, optional, max 500 chars)
- [ ] The system auto-fetches the current market price at execution time.
- [ ] Trade executes instantly as a market order.
- [ ] A `Transaction` record is created with:
  - `type = SELL`
  - `symbol` normalised to UPPERCASE
  - `price` = auto-fetched current price
  - `quantity` = requested sell quantity
  - `executedAt` = `DateTime.UtcNow`
  - `fee = 0`
- [ ] `portfolio.cashBalance` is **incremented** by `quantity × price` atomically.
- [ ] Realised profit is **not stored** on the transaction in Sprint 1 — it is computed by `FifoEngine` on read.
- [ ] The response returns `SimulationTradeResponse` including `remainingCashBalance`.
- [ ] After execution, the holdings table reflects the reduced position (or closed position if fully sold).
- [ ] After execution, the cash balance card reflects the increased balance.

### Edge Cases

- [ ] `quantity ≤ 0` returns `400 Bad Request`.
- [ ] Attempting to sell more shares than held returns `400 Bad Request` (enforced by SS-SS01-008).
- [ ] Attempting to sell a symbol with no holding in this portfolio returns `400 Bad Request`: `"You do not hold any shares of {symbol} in this portfolio."`.
- [ ] `symbol` not found in market data returns `400 Bad Request`: `"Symbol not found or price unavailable."`
- [ ] Portfolio not owned by user returns `403 Forbidden`.
- [ ] Portfolio type is not `SIMULATION` returns `400 Bad Request`.
- [ ] Selling the full quantity closes the position entirely (holding quantity → 0; the symbol no longer appears in the holdings table).

---

## Technical Notes

### Backend

**New endpoint — `SimulationController.cs`**

```
POST /api/simulation/sell
```

- `[FirebaseAuthorize]`, `[HttpPost("sell")]`
- Validates request DTO.
- Delegates to `ISimulationTradeService.ExecuteSellAsync(...)`.
- Returns `201 Created` with `SimulationTradeResponse`.

**Service — `SimulationTradeService`**

```csharp
Task<SimulationTradeResponse> ExecuteSellAsync(
    Guid portfolioId,
    string userId,
    string symbol,
    decimal quantity,
    string? notes
);
```

Steps inside `ExecuteSellAsync`:

1. Load portfolio; validate ownership and `PortfolioType == Simulation`.
2. Fetch all non-deleted `BUY` and `SELL` transactions for this portfolio and symbol.
3. Pass to `IFifoEngine.CalculateRemainingLots(transactions)` to get `availableQuantity`.
4. Validate `availableQuantity >= quantity` (throw `InsufficientHoldingsException` if not).
5. Fetch current price via `IMarketPriceService.GetPriceAsync(symbol)`.
6. Inside `IDbContextTransaction`:
   - Create `Transaction` record (`SELL`, price, quantity, fee=0, notes).
   - Increment `portfolio.CashBalance += quantity × price`.
   - Save changes.
7. Return `SimulationTradeResponse`.

**Note on FifoEngine reuse:**  
`IFifoEngine` is registered as a `Singleton`. `CalculateRemainingLots` accepts a list of `Transaction` records and returns remaining lots with their quantities. Only the total available quantity is needed here — full P&L calculation is deferred to Sprint 2 (Holdings & Position Tracking).

**New DTO — `SimulationSellRequest`**

```csharp
public class SimulationSellRequest
{
    public Guid PortfolioId { get; set; }
    public string Symbol { get; set; }
    public decimal Quantity { get; set; }
    public string? Notes { get; set; }
}
```

Response reuses `SimulationTradeResponse` from SS-SS01-005.

### Frontend

**`SimulationTradeForm.tsx`** (extended from SS-SS01-005)

- Add a `BUY / SELL` toggle.
- When `SELL` is selected:
  - Show available quantity from `useHoldings(portfolioId)` for the selected symbol.
  - Validate that entered quantity ≤ available quantity client-side.
  - Show estimated proceeds: `quantity × currentPrice`.
  - Show estimated cash after trade.

**`OrderConfirmationDialog.tsx`** (extended from SS-SS01-005)

- When side is `SELL`: show "Estimated Proceeds" instead of "Total Cost".
- Show current held quantity and quantity after sell.
- Confirm button calls `simulationSell(request)`.

**`transaction-service.ts`**

- Add `simulationSell(request: SimulationSellRequest): Promise<SimulationTradeResponse>`.

**`use-simulation-trade.ts`**

- Add `useSimulationSell()` mutation in parallel with `useSimulationBuy()` from SS-SS01-005.

---

## Dependencies

| Dependency                        | Type         | Notes                                                                    |
| --------------------------------- | ------------ | ------------------------------------------------------------------------ |
| SS-SS01-001                       | Blocking     | `cashBalance` column required                                            |
| SS-SS01-004                       | Blocking     | Portfolio type guard required                                            |
| SS-SS01-005                       | Blocking     | `SimulationTradeResponse` DTO and `SimulationTradeForm` established here |
| SS-SS01-008                       | Blocking     | Insufficient holdings validation fires before sell executes              |
| SS-SS01-009                       | Blocking     | Auto-price-fetch integral to sell flow                                   |
| Existing `IFifoEngine`            | Code — reuse | `CalculateRemainingLots()` used for available quantity check             |
| Existing `IMarketPriceService`    | Code — reuse | `GetPriceAsync(symbol)`                                                  |
| Existing `ITransactionRepository` | Code — reuse | `CreateAsync(transaction)`                                               |

---

## Out of Scope

- Short selling (selling shares not owned)
- Partial sell with stop-loss
- Limit sell orders (future sprint)
- Realized P&L stored on the transaction record (computed on read by FifoEngine — Sprint 2)
