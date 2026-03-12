# Real-Time System – Stoxly

## Overview

Stoxly provides real-time stock price updates using **SignalR**. The backend pushes price changes directly to connected clients every 30 seconds, eliminating polling from the frontend.

---

# Technology

- **ASP.NET Core SignalR** (built-in, no extra NuGet package)
- **WebSocket transport**
- **`@microsoft/signalr`** client on the Next.js frontend

---

# Backend Implementation

## PriceHub

File: `apps/api/src/Stoxly.Api/Hubs/PriceHub.cs`

Hub endpoint: `/hubs/prices`

`PriceHub` manages per-symbol subscription groups. Each symbol gets a dedicated SignalR group named `price:{SYMBOL}` (e.g. `price:AAPL`). Clients join only the groups they care about, keeping payload volume low.

Client-callable hub methods:

| Method                          | Effect                                     |
| ------------------------------- | ------------------------------------------ |
| `SubscribeToSymbol(symbol)`     | Adds client to group `price:{SYMBOL}`      |
| `UnsubscribeFromSymbol(symbol)` | Removes client from group `price:{SYMBOL}` |

## PriceUpdateDto

File: `apps/api/src/Stoxly.Api/Hubs/PriceUpdateDto.cs`

Payload broadcast on the `PriceUpdated` event:

```json
{
  "symbol": "AAPL",
  "price": 211.45,
  "change": 1.25,
  "changePercent": 0.59,
  "updatedAt": "2026-03-12T15:30:00Z"
}
```

Only the four fields needed for a live price ticker are included — not the full OHLC quote — to keep broadcast payloads minimal.

## PriceUpdateWorker

File: `apps/api/src/Stoxly.Api/BackgroundServices/PriceUpdateWorker.cs`

An `IHostedService` (`BackgroundService`) running inside the API process.

**Interval:** 30 seconds

**Tick sequence:**

1. Opens a DI scope (required because `AppDbContext` and `IMarketDataService` are scoped).
2. Queries `transactions` for all distinct, non-deleted symbols — these represent the full set of symbols currently held across all user portfolios.
3. Calls `IMarketDataService.GetPricesAsync(symbols)`:
   - Checks `stock:price:{SYMBOL}` in Redis first (60 s TTL).
   - Falls back to Finnhub `/quote` and writes result back to Redis on miss.
4. Broadcasts a `PriceUpdated` event to each symbol's SignalR group concurrently via `Task.WhenAll`.

Exceptions within a tick are caught and logged. The loop never crashes the host process.

**Watchlist note:** Once the `watchlists` table is implemented, those symbols will be merged into the collection in step 2.

---

# Price Update Flow

```
PriceUpdateWorker ticks (every 30 s)
  → queries distinct symbols from transactions
  → GetPricesAsync: Redis hit OR Finnhub fetch + Redis write
  → IHubContext<PriceHub>.Clients.Group("price:AAPL").SendAsync("PriceUpdated", dto)
  → subscribed frontend clients receive event
  → UI updates ticker / portfolio value
```

---

# Frontend Integration

The SignalR client is fully implemented in the Next.js frontend.

## Connection factory

File: `apps/web/src/lib/signalr.ts`

```ts
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { auth } from "@/lib/firebase";

export function createPriceHubConnection() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SIGNALR_URL ?? "http://localhost:5000/hubs";

  return new HubConnectionBuilder()
    .withUrl(`${baseUrl}/prices`, {
      accessTokenFactory: async () => {
        const token = await auth.currentUser?.getIdToken();
        return token ?? "";
      },
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();
}
```

## usePriceSocket hook

File: `apps/web/src/hooks/use-price-socket.ts`

```ts
export function usePriceSocket(
  symbols: string[],
): Record<string, PriceUpdateDto>;
```

- Accepts an array of tickers (e.g. the symbols in the active portfolio).
- On mount: creates a connection, starts it, calls `SubscribeToSymbol` for each symbol.
- On unmount: calls `connection.stop()` and clears the ref.
- Symbols array is sorted and joined into a stable key — reconnection only fires when the set of symbols actually changes, not on every render.
- Returns a `Record<string, PriceUpdateDto>` map that is updated in real time as `PriceUpdated` events arrive.

## PriceUpdateDto (TypeScript)

```ts
interface PriceUpdateDto {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  updatedAt: string; // ISO 8601
}
```

## Integration in pages

The `priceOverrides` prop on `HoldingsTable` accepts `Record<string, PriceUpdateDto>`. Pages wire it like:

```tsx
const priceOverrides = usePriceSocket(symbols);
<HoldingsTable holdings={holdings} priceOverrides={priceOverrides} />;
```

When an override arrives for a row, the row's `currentPrice`, `value`, and `unrealizedProfit` columns update immediately and flash briefly to draw attention.

The portfolio detail page also calls `useMetrics(portfolioId)` (a TanStack Query hook backed by `GET /api/portfolios/{id}/metrics`, 30 s stale time) to show live aggregate metrics.

---

# Subscription Strategy

Clients subscribe only to symbols in their active portfolio (and watchlist, once implemented). This limits each connection to receiving only relevant updates, keeping payload volume proportional to the user's holdings count rather than the total symbol universe.

---

# Performance Considerations

- Payloads are minimal: 5 fields per symbol update.
- Redis absorbs repeated Finnhub calls — Finnhub is only called on cache miss.
- Concurrent broadcasts per tick use `Task.WhenAll` to avoid head-of-line blocking.
- The worker runs a single DB query per tick regardless of connected client count.

---

# Scaling Strategy

For multi-instance deployments:

- Add a **Redis backplane** (`builder.Services.AddSignalR().AddStackExchangeRedis(...)`) so hub groups are shared across instances.
- Alternatively, use **Azure SignalR Service** to offload connection management entirely.

Neither is needed for single-instance deployments.

---

# Failure Handling

- Worker tick exceptions are caught and logged; the 30 s loop continues.
- Finnhub errors result in the symbol being skipped for that tick (no partial broadcast).
- Client disconnects are handled automatically by SignalR group membership cleanup.
- Frontend should use `withAutomaticReconnect()` and fall back to a REST price fetch on initial load.

---

# Future Improvements

- Watchlist price updates once the watchlists feature is implemented.
- Event throttling or diff-only broadcasting for high-frequency market hours.
- WebSocket compression for connections with many subscribed symbols.
