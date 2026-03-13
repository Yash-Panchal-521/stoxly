# Stoxly Features

## Overview

Stoxly is a stock portfolio management platform that allows users to simulate trading, track investments, and monitor portfolio performance with real-time market data.

This document lists the major features of the platform.

---

# Core Features (MVP)

## Authentication

Authentication is handled through Firebase Authentication.

Capabilities:

- email/password login
- Firebase-managed identity
- Firebase ID token authentication for protected API calls
- optional social login (future)

---

## Portfolio Management

Users can manage investment portfolios.

Capabilities:

- create portfolio
- rename portfolio
- delete portfolio
- view portfolio summary
- manage multiple portfolios

---

## Holdings Tracking

Users can track the stocks they currently own.

Information shown:

- stock symbol
- quantity owned
- average buy price
- current market price
- total holding value
- profit or loss

---

## Trade Simulation

Users can simulate stock trading.

Supported actions:

- buy stocks
- sell stocks

Each trade creates a transaction record and updates portfolio holdings.

---

## Transaction History

Users can view a complete history of trades.

Information displayed:

- stock symbol
- transaction type (buy or sell)
- quantity
- trade price
- execution date

---

## Stock Search

Users can search for stocks using:

- stock symbol
- company name

Search results show:

- stock symbol
- company name
- exchange

Symbols are validated against the local database before any transaction is accepted. Users must select a known symbol via the search component.

---

## Historical Price Lookup

The API provides closing prices for any symbol on any past trading date.

- Powered by **Yahoo Finance** (no API key required, free tier unlimited).
- Weekend and public holiday dates automatically fall back to the nearest prior trading day.
- Results are cached in Redis for 24 hours.
- Accessible via `GET /api/market/historical-price?symbol=AAPL&date=2026-03-10`.

---

## Watchlist

Users can track stocks they are interested in without holding them.

Capabilities:

- add any valid stock symbol to the watchlist
- remove stocks from the watchlist
- view all watched stocks with live prices, day change, and change %
- click any row to open the stock detail screen

Live prices are delivered via SignalR. Every row in the watchlist table flashes green or red when a real-time price tick arrives. The `PriceUpdateWorker` includes all watchlisted symbols when fetching prices.

---

## Stock Detail Screen

A dedicated detail screen is available for each watchlisted stock at `/watchlist/{symbol}`.

Information shown:

- Live price with flash animation (SignalR)
- Day change and change % with colour coding
- Company name and ticker badge
- Key statistics: Open, Day High, Day Low, Previous Close
- Interactive historical price chart with 1W / 1M / 3M / 6M / 1Y range selector
- Add / Remove Watchlist button

The price chart is rendered as a custom SVG area chart with a smooth cardinal-spline line, gradient fill, y-axis grid, x-axis date labels, and a crosshair tooltip. Data is served by `GET /api/market/chart/{symbol}?range=`, cached in Redis for 24 hours.

---

## Real-Time Price Updates

Stoxly provides live stock price updates using **SignalR**. The backend pushes price changes every 30 seconds; the frontend receives them instantly without polling.

### Backend

- `PriceUpdateWorker` ticks every 30 s, calls `IMarketDataService.GetPricesAsync` (Redis-first, Finnhub fallback) for all held symbols, and broadcasts `PriceUpdated` events via `PriceHub`.
- `IMarketPriceService` / `LiveMarketPriceService` — thin bridge that gives `HoldingsService` and `PortfolioMetricsService` access to current prices at request time.

### Frontend

- `apps/web/src/lib/signalr.ts` — `createPriceHubConnection()` factory.
- `apps/web/src/hooks/use-price-socket.ts` — `usePriceSocket(symbols)` hook returns a live `Record<string, PriceUpdateDto>` price-override map.
- Holdings rows flash when a live price override arrives.
- Dashboard stat cards aggregate live portfolio values across all portfolios.

---

## Live Portfolio Metrics

The `GET /api/portfolios/{id}/metrics` endpoint returns portfolio-level aggregates resolved against live market prices:

- `portfolioValue` — current market value of all holdings
- `totalInvested` — total cost basis
- `unrealizedProfit` / `realizedProfit` / `totalProfit`

The frontend calls this via `useMetrics(portfolioId)` (TanStack Query, 30 s stale time) on the portfolio detail page.

---

## Theme Mode Toggle

Users can switch between **dark mode** (default) and **light mode** using the Sun/Moon toggle button in the top navigation bar.

Implementation:

- Powered by **`next-themes`** with `attribute="class"` strategy.
- The `html` element receives the `light` class when light mode is active; all CSS variables respond automatically.
- `ThemeToggle` component lives in `apps/web/src/components/ui/theme-toggle.tsx`.
- Preference persists in `localStorage` across sessions.

---

# Advanced Features (Future)

These features may be added in future versions.

---

## Portfolio Analytics

Users can analyze portfolio performance.

Examples:

- total return
- unrealized gains
- performance over time
- asset allocation

---

## Historical Price Charts

Interactive price charts are available on the Stock Detail screen.

- Powered by a custom SVG chart (no third-party chart library required).
- Range selector: 1W, 1M, 3M, 6M, 1Y.
- Hover tooltip shows exact date and closing price.
- Data fetched from `GET /api/market/chart/{symbol}?range=`, cached in Redis for 24 hours.
- Weekend and holiday dates are automatically absent from the series.

---

## Dividend Tracking

Users can track dividend payments for dividend-paying stocks.

---

## Portfolio Comparison

Users can compare multiple portfolios.

---

## Multi-Market Support

Future versions may support multiple stock exchanges.

---

# Non-Functional Features

Stoxly also focuses on engineering quality.

Key qualities include:

- real-time data processing
- scalable backend architecture
- fast UI performance
- secure authentication through Firebase
- maintainable codebase
