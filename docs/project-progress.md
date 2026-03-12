# Stoxly — Project Progress

> Last updated: March 12, 2026

---

## Overall Status

| Area                           | Status                                          |
| ------------------------------ | ----------------------------------------------- |
| Authentication                 | ✅ Complete                                     |
| Portfolio Management           | ✅ Complete                                     |
| Transaction Recording          | ✅ Complete                                     |
| Holdings Tracking              | ✅ Complete                                     |
| Portfolio Metrics              | 🔄 Backend done, UI pending                     |
| Dashboard UI                   | ✅ Complete                                     |
| Landing Page                   | ✅ Complete                                     |
| Design System                  | ✅ Complete                                     |
| Market Data Module             | ✅ Complete                                     |
| Symbol Search                  | ✅ Complete (DB-first + Finnhub)                |
| Redis Price Caching            | ✅ Complete (60 s live, 24 h historical)        |
| Background Price Worker        | ✅ Complete (30 s interval)                     |
| Real-Time Updates (SignalR)    | ✅ Backend complete, frontend next              |
| Symbol Validation              | ✅ Complete                                     |
| Rate Limiting                  | ✅ Complete (30 req/min per IP)                 |
| Historical Price API           | ✅ Complete (Yahoo Finance, weekend fallback)   |
| Alpha Vantage integration      | 🗑️ Removed (replaced by Yahoo Finance)         |
| Watchlist                      | ❌ Not started                                  |

---

## What's Been Built

### Authentication

Users can register, log in with email/password or Google, reset their password, and log out. Sessions are protected across both the frontend and backend using Firebase.

### Portfolio Management

Users can create multiple portfolios, rename or delete them, and have one marked as their default. Basic validations are in place such as name length and a portfolio cap per user.

### Transaction Recording

Users can log buy and sell trades against a portfolio — including symbol, quantity, price, fees, date, and notes. Transactions can be edited and deleted. Symbols are validated against the `symbols` table before a transaction is accepted — users must search for and select a known symbol first.

### Holdings Tracking

Holdings are calculated automatically from transaction history using a FIFO cost basis method. The system tracks quantity held, average purchase price, and realized profit from closed positions.

### Portfolio Metrics

The backend calculates total portfolio value, total invested capital, realized profit, unrealized profit, and overall return. The UI currently shows placeholder values pending live market price integration.

### Dashboard

The main dashboard shows an overview of all portfolios with stat cards, a portfolio list, and a create-portfolio flow. Each portfolio has its own detail page showing holdings and transaction history.

### Landing Page

A full marketing landing page is in place covering the product hero, feature highlights, how-it-works walkthrough, analytics preview, social proof, security messaging, and a call-to-action.

### Design System

A consistent visual language is established across the app — color tokens, typography scale, reusable component styles (cards, buttons, inputs, badges), and layout patterns for both dashboard and auth pages.

### Market Data Module

A self-contained `MarketData` module handles all stock data concerns:

- **Finnhub integration** — typed HTTP client (`IFinnhubClient` / `FinnhubClient`) for `/quote`, `/search`, and `/stock/candle` endpoints. Used for live prices and bulk quotes.
- **Yahoo Finance integration** — typed HTTP client (`IYahooFinanceClient` / `YahooFinanceClient`) calling `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`. Used exclusively for historical daily closing prices. Handles weekend/holiday fallback by scanning up to 14 prior trading days.
- **Redis caching** — `IMarketDataCache` / `RedisMarketDataCache` backed by `IDistributedCache`. Live price key: `stock:price:{SYMBOL}` (60 s TTL). Historical price key: `stock:historical:{SYMBOL}:{YYYY-MM-DD}` (24 h TTL). Search results cached at `market:search:{query}` (5 min).
- **MarketDataService** — orchestrates Redis-first lookup, Finnhub or Yahoo Finance fallback depending on query type, and symbol persistence.
- **MarketController** — exposes `GET /api/market/price/{symbol}`, `POST /api/market/prices` (batch), `GET /api/market/search?q=`, and `GET /api/market/historical-price?symbol=&date=` endpoints.

### Symbol Search

Symbol search is DB-first: the `symbols` PostgreSQL table is queried first using a case-insensitive `ILike` match. If fewer than 5 local results are found, the Finnhub `/search` API is called and results are upserted back into the table for future lookups. Results are deduplicated and cached.

### Symbols Table

A dedicated `symbols` table stores discovered tickers with name, exchange, currency, and type. Populated lazily on first search. The `SymbolRepository` provides exact lookup, partial search (ILike), and batch upsert.

### Symbol Validation on Transactions

The `TransactionService` calls `ISymbolRepository.GetSymbolAsync` before creating a transaction. If the ticker is not in the `symbols` table, a `400 Bad Request` is returned with a message instructing the user to search for the symbol first.

### Rate Limiting

The `GET /api/market/search` endpoint is protected by a fixed-window rate limiter: 30 requests per minute per IP address using ASP.NET Core's built-in `System.Threading.RateLimiting`.

### Symbol Search UI Component

A reusable `StockSearch` React component provides a debounced (300 ms) combobox backed by the market search API. Features include keyboard navigation (↑ ↓ Enter Escape), ARIA `combobox`/`listbox`/`option` roles, a loading spinner, a clear button, and outside-click dismissal.

The transaction creation form replaces the free-text symbol input with `StockSearch`. On selection, a styled chip shows the company name, ticker, and exchange. The submit button is disabled until a valid symbol is selected. Deselecting the chip restores the search input and resets form state.

### Background Price Worker

`PriceUpdateWorker` is an `IHostedService` (BackgroundService) that runs every 30 seconds:

1. Collects distinct symbols from all non-deleted transactions (watchlist symbols will be merged once that feature is built).
2. Calls `IMarketDataService.GetPricesAsync` — Redis-first, Finnhub fallback.
3. Broadcasts `PriceUpdated` events via SignalR to subscribed clients.

Errors are caught and logged per tick so the loop never crashes the host.

### SignalR Real-Time Hub

`PriceHub` (mounted at `/hubs/prices`) manages client subscriptions to per-symbol groups. Clients call `SubscribeToSymbol("AAPL")` to join group `price:AAPL` and receive `PriceUpdated` events. The `PriceUpdateDto` payload contains: `symbol`, `price`, `change`, `changePercent`, `updatedAt`.

---

## What's Next

| Feature                        | Notes                                                              |
| ------------------------------ | ------------------------------------------------------------------ |
| Frontend SignalR integration   | Connect to `/hubs/prices`, subscribe to held symbols, update UI    |
| Replace StubMarketPriceService | Wire portfolio metrics to live `IMarketDataService.GetPricesAsync` |
| Watchlist feature              | DB model, API, UI; worker will auto-include watchlist symbols      |
| Portfolio metrics UI           | Unblock once live prices flow into `PortfolioMetricsService`       |
| Apply EF migration             | Run `dotnet ef database update` to create `symbols` table in prod  |
| Set Finnhub API key            | Populate `Finnhub:ApiKey` in production config                     |
| Historical price charts        | Frontend chart component backed by `/api/market/historical-price`  |
