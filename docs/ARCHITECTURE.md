# Stoxly Architecture

## Overview

Stoxly is a full-stack stock portfolio management platform designed to demonstrate modern software architecture, real-time data systems, and scalable backend design.

The platform allows users to:

- Track their stock portfolio
- Simulate buy/sell transactions
- Monitor portfolio performance
- Receive real-time stock price updates
- Maintain a watchlist of stocks
- View historical price charts per watchlisted stock

Authentication is handled through Firebase Authentication. The frontend signs users in with Firebase and the backend verifies Firebase ID tokens without storing passwords.

---

# System Architecture

The system consists of three main layers:

1. Frontend Application
2. Backend API
3. Data & Infrastructure Services

High-level architecture:

```
User
→ Next.js Frontend (Vercel)
→ ASP.NET Core API (Azure App Service)
→ PostgreSQL (Azure Database for PostgreSQL)
→ Redis (Azure Cache for Redis)
```

Real-time flow:

```
PriceUpdateWorker (every 30 s)
→ IMarketDataService.GetPricesAsync (Redis-first, Finnhub fallback for live quotes)
→ Redis cache updated
→ PriceHub broadcasts PriceUpdated via SignalR
→ Frontend updates ticker / portfolio value
```

Historical price flow:

```
GET /api/market/historical-price?symbol=AAPL&date=2026-03-10
→ MarketDataService.GetHistoricalPriceAsync
→ Redis check (stock:historical:{SYMBOL}:{DATE}, 24 h TTL)
→ On miss: YahooFinanceClient fetches daily candles, picks closest prior trading day
→ Result written to Redis
→ StockHistoricalPriceDto returned
```

Stock chart flow:

```
GET /api/market/chart/AAPL?range=3M
→ MarketDataService.GetDailyClosesAsync(symbol, from, to)
→ Redis check (stock:candles:{SYMBOL}:{FROM}:{TO}, 24 h TTL)
→ On miss: YahooFinanceClient fetches daily candles for the full range
→ Result written to Redis
→ Ordered list of { date, price } points returned
→ Frontend StockPriceChart renders SVG area chart
```

Authentication flow:

```
User
→ Next.js frontend
→ Firebase Authentication
→ ID token issued
→ token sent to backend API
→ ASP.NET Core verifies token
→ backend processes request
```

---

# Monorepo Structure

The repository uses a monorepo layout.

```
stoxly/
  apps/
    web/        → Next.js frontend
    api/        → ASP.NET Core API

  services/
    market-worker/  → reserved (worker is currently hosted inside the API)

  packages/
    shared-types/   → shared TypeScript types

  docs/
    architecture and project documentation
```

---

# Frontend Architecture

Framework: Next.js (App Router)

Responsibilities:

- UI rendering
- portfolio dashboard
- trade interface
- watchlist management (planned)
- real-time price display

Key technologies:

- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- SignalR client (`@microsoft/signalr`)
- Firebase SDK
- next-themes (light/dark theme system)

Folder structure under `apps/web/src/`:

```
auth/           → Firebase auth guard and context provider
components/     → shared UI components (layout, cards, shadcn wrappers)
  ui/           → includes ThemeToggle, shadcn wrappers
  layout/       → TopNav, Sidebar
  cards/        → StatCard and other card components
features/
  market/       → StockSearch combobox component
  portfolios/   → portfolio list and detail components
  transactions/ → AddTransactionDialog and transaction table
  watchlist/    → WatchlistTable, AddToWatchlistDialog, StockDetailHero,
                  StockKeyStats, StockPriceChart
hooks/          → TanStack Query hooks + SignalR hooks
  use-holdings.ts
  use-portfolios.ts
  use-portfolio.ts
  use-transactions.ts
  use-performance.ts
  use-price-socket.ts   → SignalR subscription hook (live price overrides)
  use-metrics.ts        → TanStack Query hook for /metrics endpoint
  use-watchlist.ts      → TanStack Query hooks for watchlist CRUD
  use-stock-detail.ts   → hooks for live stock price + chart data
lib/            → api-client, firebase init, utils, signalr.ts
services/       → API wrappers (portfolio-service, transaction-service, market-service)
types/          → TypeScript types (portfolio, transaction, market)
```

Provider chain (wraps the entire app):

```
ThemeProvider (next-themes, attribute="class", defaultTheme="dark")
  → AuthProvider (Firebase auth context)
    → QueryClientProvider (TanStack Query v5)
      → ToastProvider
```

Data Flow:

```
Frontend
→ API request via apiGet/apiPost (auth token injected automatically)
→ Backend processes request
→ Response returned
→ TanStack Query cache updated
→ UI re-renders
```

---

# Backend Architecture

Framework: ASP.NET Core (.NET 8)

Backend folder structure under `apps/api/src/Stoxly.Api/`:

```
Controllers/          → thin HTTP handlers
Services/             → business logic
  PortfolioService
  HoldingsService        (enriches holdings with live prices via IMarketPriceService)
  TransactionService
  PortfolioMetricsService (computes metrics with live prices via IMarketPriceService)
  WatchlistService       (watchlist CRUD, enriches items with live prices)
  IMarketPriceService    (abstraction over real-time price lookup)
  LiveMarketPriceService (production impl — delegates to IMarketDataService)
  StubMarketPriceService (fallback / test impl — returns empty price set)
Repositories/         → EF Core data access
  WatchlistRepository  (CRUD + distinct ticker query for the price worker)
Models/               → EF Core entity classes
DTOs/                 → request/response shapes
Data/                 → AppDbContext
Migrations/           → EF Core migrations
Middleware/           → ExceptionHandlingMiddleware, FirebaseAuthMiddleware
Configurations/       → Firebase DI setup
Hubs/                 → PriceHub (SignalR), PriceUpdateDto
BackgroundServices/   → PriceUpdateWorker
MarketData/
  Caching/            → IMarketDataCache, RedisMarketDataCache, StockPriceCacheEntry
  Clients/            → IFinnhubClient, FinnhubClient, FinnhubOptions
                         IYahooFinanceClient, YahooFinanceClient
  DTOs/               → StockPriceDto, StockHistoricalPriceDto, SymbolSearchResultDto, StockSymbolDto
  Interfaces/         → IMarketDataService
  Services/           → MarketDataService
```

Layer responsibilities:

- **Controllers** — validate input, call services, return HTTP responses. No business logic.
- **Services** — all business logic lives here.
- **Repositories** — all EF Core / database access lives here.
- **Hubs** — SignalR hub for real-time price broadcasting.
- **BackgroundServices** — hosted services that run on a timer inside the API process.
- **MarketData** — self-contained module for external market data. Depends on nothing outside itself except DI-registered services.
- **IMarketPriceService / LiveMarketPriceService** — thin bridge that lets `HoldingsService` and `PortfolioMetricsService` resolve current prices without taking a direct dependency on the full `MarketData` module.

Authentication rules:

- the backend does not store passwords
- the backend does not manage login or registration flows
- ASP.NET Core only verifies Firebase JWT tokens from the Authorization header
- verified Firebase claims (`uid`, `email`) identify the user in the Stoxly database

---

# Market Data Module

All external market data concerns are encapsulated in `MarketData/`.

## Finnhub Client

`IFinnhubClient` / `FinnhubClient` provides:

- `GetQuoteAsync(symbol)` → maps Finnhub `/quote` response to `StockPriceDto`
- `GetBulkQuotesAsync(symbols)` → concurrent `/quote` calls with a 10-slot semaphore
- `SearchSymbolsAsync(query)` → maps Finnhub `/search` response to `IReadOnlyList<StockSymbolDto>`
- `GetDailyClosesAsync(symbol, from, to)` → Finnhub `/stock/candle` (resolution `D`)

The base URL and API key are configured via `FinnhubOptions` bound to the `Finnhub` configuration section.

## Yahoo Finance Client

`IYahooFinanceClient` / `YahooFinanceClient` provides historical daily price data:

- `GetDailyClosesAsync(symbol, from, to)` → calls `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&period1=…&period2=…`. Parses the `timestamp` array and the `indicators.quote[0].close` array into a `Dictionary<DateOnly, decimal>`.
- `GetHistoricalPriceAsync(symbol, date)` → fetches 14 days ending on `date`, returns the closing price for `date` or the nearest prior trading day if `date` falls on a weekend or market holiday.

No API key is required. A `User-Agent` header is set on the `HttpClient` to avoid 403 responses from Yahoo's CDN.

Alpha Vantage has been fully removed. All historical price lookups now route through Yahoo Finance.

## Redis Caching

`IMarketDataCache` / `RedisMarketDataCache` wraps `IDistributedCache` with generic `GetAsync<T>` / `SetAsync<T>` methods using `System.Text.Json` serialisation.

Cache key schema:

| Key pattern                          | Value type                    | TTL   |
| ------------------------------------ | ----------------------------- | ----- |
| `stock:price:{SYMBOL}`               | `StockPriceCacheEntry`        | 60 s  |
| `stock:historical:{SYMBOL}:{DATE}`   | `StockHistoricalPriceDto`     | 24 h  |
| `stock:candles:{SYMBOL}:{FROM}:{TO}` | `Dictionary<string, decimal>` | 24 h  |
| `market:search:{query}`              | `List<SymbolSearchResultDto>` | 5 min |

`StockPriceCacheEntry` stores only `{ Price, Change, ChangePercent, UpdatedAt }` — the minimal fields needed by price tickers — rather than the full OHLC `StockPriceDto`.

## MarketDataService

Orchestrates:

1. Read from Redis (`IMarketDataCache`).
2. On miss: call Finnhub (`IFinnhubClient`) for live prices, Yahoo Finance (`IYahooFinanceClient`) for historical prices; write result back to Redis.
3. For `GetHistoricalPriceAsync`: if the requested date is today, falls back to the live Finnhub quote; otherwise delegates to `IYahooFinanceClient.GetHistoricalPriceAsync` with weekend/holiday fallback built in.
4. For symbol search: query `symbols` table first (`ISymbolRepository`), supplement from Finnhub when < 5 local results, upsert Finnhub results into the table, cache the merged list.

---

# Real-Time System

Real-time updates use **SignalR**.

## PriceHub

`PriceHub` is mounted at `/hubs/prices`.

Client-callable methods:

- `SubscribeToSymbol(symbol)` — joins group `price:{SYMBOL}`
- `UnsubscribeFromSymbol(symbol)` — leaves group `price:{SYMBOL}`

Server-to-client event:

- `PriceUpdated` — payload is `PriceUpdateDto { Symbol, Price, Change, ChangePercent, UpdatedAt }`

## PriceUpdateWorker

`BackgroundService` hosted inside the API process. Ticks every 30 seconds:

1. Opens a DI scope to resolve `AppDbContext` and `IMarketDataService`.
2. Queries distinct symbols from all non-deleted transactions **and** all watchlist entries.
3. Calls `IMarketDataService.GetPricesAsync` (Redis-first, Finnhub `/quote` fallback).
4. Broadcasts `PriceUpdated` to per-symbol SignalR groups.

## Frontend Integration

File: `apps/web/src/lib/signalr.ts` — `createPriceHubConnection()` factory.

- URL: `${NEXT_PUBLIC_SIGNALR_URL}/prices` (env var defaults to `http://localhost:5000/hubs`)
- Auth token from `auth.currentUser?.getIdToken()` injected via `accessTokenFactory`
- `withAutomaticReconnect()` enabled

File: `apps/web/src/hooks/use-price-socket.ts` — `usePriceSocket(symbols: string[])` hook.

- Manages SignalR connection lifecycle (connect on mount, disconnect on unmount)
- Subscribes to each symbol group on connect
- Returns `Record<string, PriceUpdateDto>` — a live price-override map
- Symbols array is sorted before diffing to avoid unnecessary reconnections

The hook is consumed by the portfolio detail page, the watchlist page, and the stock detail page to overlay live prices via the `priceOverrides` prop.

---

# Database Architecture

Database: PostgreSQL

Actual implemented tables:

| Table          | Purpose                                               |
| -------------- | ----------------------------------------------------- |
| `users`        | Firebase-linked user identities                       |
| `portfolios`   | User portfolios (soft-delete, one default per user)   |
| `transactions` | Buy/sell records (soft-delete, FIFO recalculation)    |
| `symbols`      | Discovered stock tickers (lazy-populated from search) |
| `watchlists`   | Per-user watchlist entries (symbol + metadata)        |

All schema changes use EF Core migrations under `Migrations/`.

---

# Caching Layer

Redis (`Microsoft.Extensions.Caching.StackExchangeRedis`) is used as:

- **Price cache** — `stock:price:{SYMBOL}` → `StockPriceCacheEntry` (60 s)
- **Search cache** — `market:search:{query}` → `List<SymbolSearchResultDto>` (5 min)

The cache reduces Finnhub API calls and keeps the price worker's Finnhub quota low.

---

# Rate Limiting

`GET /api/market/search` is protected by a fixed-window rate limiter:

- 30 requests per minute per IP address
- Uses `System.Threading.RateLimiting` (built into ASP.NET Core — no extra package)
- Returns HTTP 429 on breach

Policy name is defined in `RateLimitPolicies.MarketSearch`.

---

# Deployment Architecture

Frontend: Vercel

Backend: Azure App Service

Infrastructure:

- Azure Database for PostgreSQL → primary database
- Azure Cache for Redis → price and search caching

---

# Scalability Considerations

The system is designed to scale by:

- separating frontend and backend services
- using Redis caching to reduce Finnhub quota consumption and DB load
- handling real-time communication via SignalR (Redis backplane available for multi-instance)
- background worker runs inside the API process today; can be extracted to a dedicated worker service if load grows

---

# System Architecture

The system consists of three main layers:

1. Frontend Application
2. Backend API
3. Data & Infrastructure Services

High-level architecture:

User
→ Next.js Frontend
→ ASP.NET Core API
→ PostgreSQL Database

Realtime updates flow through SignalR.

Authentication flow:

User
→ Next.js frontend
→ Firebase Authentication
→ ID token issued
→ token sent to backend API
→ ASP.NET Core verifies token
→ backend processes request

---

# Monorepo Structure

The repository uses a monorepo layout.

```
stoxly/
  apps/
    web/        → Next.js frontend
    api/        → ASP.NET Core API

  services/
    market-worker/  → background service for stock data

  packages/
    shared-types/   → shared TypeScript types

  docs/
    architecture and project documentation
```

---

# Frontend Architecture

Framework: Next.js (App Router)

Responsibilities:

- UI rendering
- portfolio dashboard
- trade interface
- watchlist management
- real-time price display

Key technologies:

- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- SignalR client
- Firebase SDK

Data Flow:

Frontend
→ API request
→ Backend processes request
→ Response returned
→ UI updates via React Query

Authentication Flow:

Frontend
→ Firebase Authentication sign-in
→ Firebase ID token returned
→ token included in Authorization header
→ backend verifies token before processing protected requests

---

# Backend Architecture

Framework: ASP.NET Core (.NET 8)

Backend responsibilities:

- portfolio management
- trade simulation
- stock data storage
- real-time updates
- Firebase JWT verification for protected API requests

Backend structure:

```
Controllers
Services
Repositories
Models
DTOs
Hubs
```

Layer responsibilities:

Controllers
Handle HTTP requests.

Services
Contain business logic.

Repositories
Handle database operations.

Hubs
Provide SignalR realtime communication.

Authentication rules:

- the backend does not store passwords
- the backend does not manage login or registration flows
- ASP.NET Core only verifies Firebase JWT tokens from the Authorization header
- verified Firebase claims, especially `uid` and `email`, identify the user in the Stoxly database

---

# Real-Time System

Realtime updates use **SignalR**.

Realtime events include:

- stock price updates
- portfolio value changes
- watchlist updates

Realtime flow:

Market data source
→ backend updates stock price
→ SignalR hub broadcasts update
→ frontend receives event
→ UI updates immediately

---

# Market Data Worker

A background worker service fetches market data.

Responsibilities:

- fetch stock prices from external APIs
- update price data
- trigger realtime updates

This worker runs independently of the main API.

---

# Database Architecture

Database: PostgreSQL

Core entities:

users
stocks
portfolios
holdings
transactions
watchlists
price_history

Relationships:

User → Portfolio
Portfolio → Holdings
Holding → Stock

Transactions record buy and sell events.

Users are linked to Firebase identities through `firebase_uid` instead of application-managed password credentials.

---

# Caching Layer

Redis is used for:

- caching frequently accessed stock prices
- reducing database load
- improving response performance

---

# Deployment Architecture

Frontend

Deployed on **Vercel**.

Backend

Deployed on **Azure App Service**.

Infrastructure

Azure PostgreSQL → database
Azure Redis → caching

---

# Scalability Considerations

The system is designed to scale by:

- separating frontend and backend services
- using Redis caching
- handling realtime communication via SignalR
- allowing background workers to scale independently

---

# Architectural Goals

The architecture prioritizes:

- clear separation of concerns
- scalability
- performance
- maintainability
- modern full-stack practices
