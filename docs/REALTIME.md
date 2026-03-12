# Real-Time System – Stoxly

## Overview

Stoxly provides real-time stock price updates using **SignalR**. The backend pushes price changes directly to connected clients every 30 seconds, eliminating polling from the frontend.

---

# Technology

- **ASP.NET Core SignalR** (built-in, no extra NuGet package)
- **WebSocket transport**
- **`@microsoft/signalr`** client on the Next.js frontend (planned)

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

# Frontend Integration (planned)

Install: `npm install @microsoft/signalr`

Connection setup (example):

```ts
import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
  .withUrl("/hubs/prices", {
    accessTokenFactory: () => firebaseUser.getIdToken(),
  })
  .withAutomaticReconnect()
  .build();

await connection.start();

// Subscribe to a symbol
await connection.invoke("SubscribeToSymbol", "AAPL");

// Handle incoming updates
connection.on("PriceUpdated", (update: PriceUpdateDto) => {
  // update React state / TanStack Query cache
});
```

On unmount / when holdings change, call `UnsubscribeFromSymbol` to leave stale groups.

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

- Portfolio value recalculation broadcast (`PortfolioUpdated` event) once live prices power `PortfolioMetricsService`.
- Watchlist price updates once the watchlists feature is implemented.
- Event throttling or diff-only broadcasting for high-frequency market hours.
- WebSocket compression for connections with many subscribed symbols.
