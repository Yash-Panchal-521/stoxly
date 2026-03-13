# Changelog

All notable changes to the Stoxly project will be documented in this file.

The format follows a simplified version of **Keep a Changelog** principles.

---

# [Unreleased]

Upcoming changes that are currently under development.

### Planned

- Price alerts (notify when watched stock crosses a threshold)
- CSV export of transaction history

---

# [0.5.0] - MVP Completion

### Added

- **Settings page** at `/settings` — profile (display name, read-only email), password change for
  email/password accounts (with re-authentication), and a danger-zone account deletion flow
- **Mobile responsive layout** — fixed sidebar hides on mobile (`md:hidden`), dashboard layout
  gains a hamburger button in `TopNav` that opens a slide-in `Sidebar` drawer with a backdrop overlay.
  Closing happens via close button, backdrop click, or nav-link tap. `md:pl-sidebar` applied to the
  content column so the layout is correct on desktop too.
- **Asset Allocation Chart** — donut SVG chart with a bar-legend on the portfolio detail page
  (`/portfolio/[id]`). Calculates holding weight from live price overrides when available, falling
  back to average price. Renders 10 distinct accent colors for up to 10+ symbols.
- **Trades pagination** — client-side page-size of 25 per page with Prev/Next controls and an
  "X–Y of Z transactions" summary. Page resets to 1 when the portfolio filter changes.

---

# [0.4.0] - Theme Mode Toggle

### Added

- Light/dark theme toggle in the top navigation bar (`ThemeToggle` component)
- `next-themes` integration — persists preference in `localStorage`, `attribute="class"` strategy
- Full Apple-inspired light mode palette defined in `html.light {}` CSS block
- CSS variable tokens for all layout surfaces (`--nav-bg`, `--sidebar-bg`, `--input-fill`, `--dropdown-bg`, etc.) that automatically respond to theme changes
- `.surface-hover` utility class for interactive surfaces in both themes
- `darkMode: "class"` in Tailwind config for shadcn/ui `dark:` variant support

### Changed

- `<html>` tag no longer has a hardcoded `className="dark"` — theme class is managed by `next-themes`
- `TopNav` and `Sidebar` inline `rgba()` styles replaced with CSS variable references

---

# [0.3.0] - Live Prices Frontend (STOX-101)

### Added

- `apps/web/src/lib/signalr.ts` — `createPriceHubConnection()` factory with Firebase token injection
- `apps/web/src/hooks/use-price-socket.ts` — `usePriceSocket(symbols)` hook, returns live `Record<string, PriceUpdateDto>` price-override map
- `apps/web/src/hooks/use-metrics.ts` — TanStack Query hook for `GET /api/portfolios/{id}/metrics` (30 s stale time)
- `HoldingsTable` `priceOverrides` prop — live price columns (`currentPrice`, `value`, `unrealizedProfit`) with flash animation on update
- Portfolio detail page wired with `usePriceSocket` + `useMetrics` live metrics strip
- Dashboard stat cards aggregated across all portfolios using `useQueries`

---

# [0.2.0] - Live Prices Backend (STOX-101)

### Added

- `IMarketPriceService` abstraction for resolving current prices inside business services
- `LiveMarketPriceService` — production implementation delegating to `IMarketDataService` (Redis-first, Finnhub fallback)
- `StubMarketPriceService` — always returns empty price set (used in tests / fallback)
- `HoldingsService` wired to `IMarketPriceService` — holdings response now includes `currentPrice`, `value`, `unrealizedProfit`
- `PortfolioMetricsService` wired to `IMarketPriceService` — computes `portfolioValue`, `totalInvested`, `realizedProfit`, `unrealizedProfit`, `totalProfit`
- `GET /api/portfolios/{portfolioId}/metrics` endpoint

---

# [0.1.0] - Initial Project Setup

### Added

- Monorepo project structure
- Next.js frontend application
- ASP.NET Core backend API
- PostgreSQL database integration
- Redis caching layer
- SignalR real-time communication setup (backend)
- Firebase authentication
- Portfolio, Holdings, Transaction CRUD APIs
- Market data module (Finnhub + Yahoo Finance, Redis caching)
- `PriceUpdateWorker` background service
- `PriceHub` SignalR hub at `/hubs/prices`

### Documentation

- README.md
- ARCHITECTURE.md
- DATABASE.md
- API.md
- REALTIME.md
- DEPLOYMENT.md
- CODING-STANDARDS.md
- FEATURES.md
- USER-FLOWS.md
- ROADMAP.md

### Infrastructure

- Azure deployment architecture
- Vercel frontend deployment
- Environment configuration setup

---

# Versioning Strategy

Stoxly follows **semantic versioning**.

Format:

MAJOR.MINOR.PATCH

Definitions:

MAJOR → Breaking changes  
MINOR → New features  
PATCH → Bug fixes or small improvements

Future versions will include updates such as:

- analytics dashboard
- advanced trading simulation
- improved real-time systems
- multi-market support
