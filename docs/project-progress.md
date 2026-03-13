# Stoxly — Project Progress

> Last updated: March 13, 2026

---

## Overall Status

| Area                        | Status                                             |
| --------------------------- | -------------------------------------------------- |
| Authentication              | ✅ Complete                                        |
| Portfolio Management        | ✅ Complete                                        |
| Transaction Recording       | ✅ Complete                                        |
| Holdings Tracking           | ✅ Complete                                        |
| Portfolio Metrics           | ✅ Complete (backend + UI wired to live prices)    |
| Dashboard UI                | ✅ Complete (stat cards show real aggregated data) |
| Landing Page                | ✅ Complete                                        |
| Design System               | ✅ Complete                                        |
| Theme Mode Toggle           | ✅ Complete (dark / light via next-themes)         |
| Market Data Module          | ✅ Complete                                        |
| Symbol Search               | ✅ Complete (DB-first + Finnhub)                   |
| Redis Price Caching         | ✅ Complete (60 s live, 24 h historical)           |
| Background Price Worker     | ✅ Complete (30 s interval)                        |
| Real-Time Updates (SignalR) | ✅ Complete (backend + frontend wired)             |
| Live Prices in Holdings     | ✅ Complete (`LiveMarketPriceService` wired)       |
| Live Prices in Metrics      | ✅ Complete (metrics endpoint + frontend hook)     |
| Symbol Validation           | ✅ Complete                                        |
| Rate Limiting               | ✅ Complete (30 req/min per IP)                    |
| Historical Price API        | ✅ Complete (Yahoo Finance, weekend fallback)      |
| Alpha Vantage integration   | 🗑️ Removed (replaced by Yahoo Finance)             |
| Watchlist                   | ✅ Complete (DB, API, UI, live prices, SignalR)    |
| Stock Detail Screen         | ✅ Complete (hero, key stats, historical chart)    |
| Portfolio Management Page   | ✅ Complete (table, rename, delete, live metrics)  |
| Trades Page                 | ✅ Complete (cross-portfolio, portfolio filter)    |
| Edit Transaction UI         | ✅ Complete (fee + notes via dialog)               |
| Dashboard — Watchlist Card  | ✅ Complete (live prices, change %, empty state)   |
| Dashboard — Recent Txns     | ✅ Complete (last 5 across portfolios, View all)   |

---

## What’s Been Built

### Authentication

Users can register, log in with email/password or Google, reset their password, and log out. Sessions are protected across both the frontend and backend using Firebase.

### Portfolio Management

Users can create multiple portfolios, rename or delete them, and have one marked as their default. Basic validations are in place such as name length and a portfolio cap per user.

### Transaction Recording

Users can log buy and sell trades against a portfolio — including symbol, quantity, price, fees, date, and notes. Transactions can be edited and deleted. Symbols are validated against the `symbols` table before a transaction is accepted — users must search for and select a known symbol first.

### Holdings Tracking

Holdings are calculated automatically from transaction history using a FIFO cost basis method. The system tracks quantity held, average purchase price, and realized profit from closed positions. `currentPrice`, `value`, and `unrealizedProfit` are now populated with live Finnhub prices via `LiveMarketPriceService`.

### Portfolio Metrics Endpoint

`GET /api/portfolios/{id}/metrics` returns `{ portfolioValue, totalInvested, realizedProfit, unrealizedProfit, totalProfit }` computed from live prices. The service (`PortfolioMetricsService`) fetches prices internally via `IMarketPriceService` when no explicit price map is provided.

### Live Price Wiring (STOX-101)

- **`LiveMarketPriceService`** — production bridge implementing `IMarketPriceService`. Delegates to `IMarketDataService.GetPricesAsync`, normalises symbols, handles exceptions gracefully.
- **DI swap** — `StubMarketPriceService` replaced by `LiveMarketPriceService` in `Program.cs`.
- **`HoldingsService`** — now injects `IMarketPriceService`, fetches live prices per distinct symbol, passes the price dictionary to `FifoEngine`.
- **`PortfolioMetricsService`** — injects `IMarketPriceService`, fetches prices internally when the caller does not supply them.

### Frontend — Live Prices & SignalR (STOX-101 Phase D)

- **`@microsoft/signalr`** installed in `apps/web`.
- **`src/lib/signalr.ts`** — `createPriceHubConnection()` factory using `HubConnectionBuilder` with `withAutomaticReconnect()` and Firebase `accessTokenFactory`.
- **`src/hooks/use-price-socket.ts`** — manages SignalR subscribe/unsubscribe lifecycle; accepts `symbols: string[]`; returns `Record<string, PriceUpdateDto>`.
- **`src/hooks/use-metrics.ts`** — TanStack Query hook for `GET /api/portfolios/{id}/metrics`; `staleTime` and `refetchInterval` both 30 s.
- **`HoldingsTable`** — accepts optional `priceOverrides?: Record<string, { price: number }>`. Per-row effective price uses `overridePrice ?? holding.currentPrice`. Rows flash green/red via `useEffect` + `flashMap` state when a SignalR tick arrives.
- **Portfolio detail page** — derives `symbols` from holdings, subscribes via `usePriceSocket`, displays a 4-card metrics strip (`portfolioValue`, `totalInvested`, `unrealizedProfit`, `totalProfit`), passes `priceOverrides` to `HoldingsTable`.
- **Dashboard page** — uses `useQueries` to aggregate metrics and holdings across all portfolios; stat cards show real Portfolio Value, Total Gain/Loss, Unrealized P&L, and Holdings count.

### Theme Mode Toggle

Light/dark theme switching via **`next-themes`**:

- `ThemeProvider` (`attribute="class"`, `defaultTheme="dark"`) wraps the app in `Providers`.
- CSS variables in `globals.css` are split into `:root` (dark) and `html.light` (light) blocks.
- Component surface tokens (`--sidebar-bg`, `--nav-bg`, `--dropdown-bg`, etc.) are used throughout the layout instead of hard-coded `rgba()` values, making them theme-adaptive.
- `ThemeToggle` button in `TopNav` shows a Sun icon in dark mode and a Moon icon in light mode. Renders only after mount to prevent hydration mismatch.
- `tailwind.config.ts` uses `darkMode: "class"` so all shadcn/ui `dark:` variants work correctly.
- `.surface-hover` utility class adapts hover background per theme.

### Dashboard

The main dashboard shows an overview of all portfolios. Stat cards display **real aggregated numbers** fetched via `useQueries` across all portfolios (total portfolio value, total P&L, unrealized P&L, unique holdings count). Each portfolio has its own detail page.

The dashboard also includes two overview cards:

- **Watchlist card** — fetches the user’s watchlist via `useWatchlist()` and renders each item with symbol, company name, current price, and `+/-` % change coloured green/red. Shows a skeleton while loading and an empty state when nothing is watchlisted.
- **Recent Transactions card** — fetches all user transactions via `useAllTransactions()` and displays the 5 most recent entries in a table (date, symbol, portfolio name, BUY/SELL badge, quantity, total). Includes a “View all” link to `/trades` when entries exist.

### Portfolio Management Page `/portfolio`

A dedicated management table at `/portfolio` lists all portfolios with live value, total P&L, base currency, and creation date. Actions per row: Open (navigates to detail), Rename (`RenamePortfolioDialog`), Delete (`DeletePortfolioDialog` with `redirectTo="/portfolio"`). A “New Portfolio” button opens `CreatePortfolioModal`.

### Landing Page

A full marketing landing page is in place covering product hero, feature highlights, how-it-works walkthrough, analytics preview, social proof, security messaging, and a call-to-action.

### Design System

A consistent visual language is established across the app — color tokens (dark + light palettes), typography scale, reusable component styles (cards, buttons, inputs, badges), layout patterns for both dashboard and auth pages, and a `.surface-hover` utility for theme-adaptive hover states.

### Market Data Module

A self-contained `MarketData` module handles all stock data concerns:

- **Finnhub integration** — typed HTTP client (`IFinnhubClient` / `FinnhubClient`) for `/quote`, `/search`, and `/stock/candle` endpoints. Used for live prices and bulk quotes.
- **Yahoo Finance integration** — typed HTTP client (`IYahooFinanceClient` / `YahooFinanceClient`) calling `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`. Used exclusively for historical daily closing prices. Handles weekend/holiday fallback by scanning up to 14 prior trading days.
- **Redis caching** — `IMarketDataCache` / `RedisMarketDataCache` backed by `IDistributedCache`. Live price key: `stock:price:{SYMBOL}` (60 s TTL). Historical price key: `stock:historical:{SYMBOL}:{YYYY-MM-DD}` (24 h TTL). Search results cached at `market:search:{query}` (5 min).
- **MarketDataService** — orchestrates Redis-first lookup, Finnhub or Yahoo Finance fallback depending on query type, and symbol persistence.
- **MarketController** — exposes `GET /api/market/price/{symbol}`, `POST /api/market/prices` (batch), `GET /api/market/search?q=`, and `GET /api/market/historical-price?symbol=&date=` endpoints.

### Symbol Search

Symbol search is DB-first: the `symbols` PostgreSQL table is queried first using a case-insensitive `ILike` match. If fewer than 5 local results are found, the Finnhub `/search` API is called and results are upserted back into the table for future lookups. Results are deduplicated and cached.

### Rate Limiting

The `GET /api/market/search` endpoint is protected by a fixed-window rate limiter: 30 requests per minute per IP address using ASP.NET Core’s built-in `System.Threading.RateLimiting`.

### Background Price Worker & SignalR Hub

`PriceUpdateWorker` runs every 30 seconds: collects distinct symbols from all non-deleted transactions **and all watchlist entries**, calls `IMarketDataService.GetPricesAsync`, and broadcasts `PriceUpdated` events via SignalR `PriceHub` to subscribed clients. The frontend subscribes to these events through `usePriceSocket`.

### Watchlist

Users can add and remove stocks from a personal watchlist without holding them.

- **Backend** — `Watchlist` EF Core model, `WatchlistRepository` (CRUD + distinct ticker query), `WatchlistService` (enrich with live prices via `IMarketDataService`), `WatchlistController` (`GET /api/watchlist`, `POST /api/watchlist`, `DELETE /api/watchlist/{symbol}`). EF Core migration applied.
- **Price worker** — `PriceUpdateWorker` now queries watchlist symbols in addition to transaction symbols so live ticks fire for watched stocks even when they are not held.
- **Frontend** — `WatchlistTable` (live price overrides + flash animation, clickable rows), `AddToWatchlistDialog`, `use-watchlist.ts` hooks (`useWatchlist`, `useAddToWatchlist`, `useRemoveFromWatchlist`), watchlist page at `/watchlist`.

### Stock Detail Screen

A full-detail screen is available at `/watchlist/{symbol}` for any watchlisted stock.

- **Backend** — `GET /api/market/chart/{symbol}?range=` endpoint added to `MarketController`. Wraps the existing `GetDailyClosesAsync` (Redis-cached 24 h) and returns `{ symbol, range, points: [{date, price}] }`.
- **Frontend** — `StockDetailHero` (live price with SignalR flash, add/remove watchlist button), `StockKeyStats` (Open / Day High / Day Low / Prev. Close grid), `StockPriceChart` (custom SVG area chart, 1W/1M/3M/6M/1Y range tabs, crosshair tooltip), `use-stock-detail.ts` (`useStockPrice`, `useStockChart` TanStack Query hooks), detail page at `app/(dashboard)/watchlist/[symbol]/page.tsx`.
- No third-party chart library introduced — the SVG chart reuses the same cardinal-spline technique as `PerformanceChart`.

### Trades Page `/trades`

A cross-portfolio transaction history page at `/trades`. Fetches all user transactions via `GET /api/transactions` (`useAllTransactions` hook). Client-side portfolio filter renders a `<Select>` populated from `usePortfolios()`. Portfolio name cells are clickable links to the portfolio detail page. Columns: Date, Portfolio, Symbol, Type, Quantity, Price, Total, Notes.

### Edit Transaction UI

`EditTransactionDialog` allows editing `fee` and `notes` on an existing transaction. Pre-fills both fields from the current transaction. Calls `PATCH /api/transactions/{id}`. Accessible via an Edit button in `TransactionList` (portfolio detail page).

### Dev Tooling — WSL Redis Auto-Start

`stoxly.sh` auto-starts Redis with a 3-tier priority:

1. Already running on port 6379 → skip.
2. Native `redis-server` on Windows PATH → background process.
3. **WSL Ubuntu fallback** → opens a dedicated `cmd.exe` window titled “Stoxly - Redis (WSL)” running `wsl.exe -d Ubuntu -- redis-server`. WSL2 port forwarding makes Redis reachable at `localhost:6379` from Windows. Graceful stop uses `redis-cli shutdown`; force-stop uses `pkill -9 redis-server` inside WSL.

---

## What’s Next

| Feature           | Notes                                                              |
| ----------------- | ------------------------------------------------------------------ |
| Mobile layout     | Responsive sidebar collapse for small screens (hamburger + drawer) |
| Portfolio charts  | Historical performance chart is already built; extend to dashboard |
| Settings page     | `/settings` route referenced in sidebar but not yet built          |
| Price alerts      | Notify users when a watched stock crosses a threshold              |
| Dividend tracking | Track dividend payments for portfolio holdings                     |
