## applyTo: apps/web/\*\*

# Frontend Development Instructions – Stoxly

These instructions apply to the **Next.js frontend** of the Stoxly project.

## Framework

Frontend uses:

- Next.js (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- SignalR client

All frontend code should follow modern **React + Next.js best practices**.

---

# Component Design

Components should be:

- small
- reusable
- focused on a single responsibility

Prefer composition over large monolithic components.

Example component structure:

components/

- PortfolioCard
- StockSearch
- WatchlistItem
- TradeForm

---

# Server vs Client Components

Prefer **Server Components** whenever possible.

Use **Client Components only when needed**, such as:

- user interactions
- local UI state
- SignalR connections

Always add:

"use client"

only when necessary.

---

# State Management

Use the following approach:

Server state
→ TanStack Query

Client UI state
→ Zustand

Avoid unnecessary global state.

---

# API Communication

All API communication should go through a dedicated API service layer.

Example structure:

services/

- portfolioService.ts
- stockService.ts
- tradeService.ts

Do not call API endpoints directly inside components.

---

# Styling Guidelines

Use:

- TailwindCSS
- shadcn/ui components

Avoid:

- inline styles
- custom CSS unless necessary

Maintain consistent spacing and layout patterns.

---

# Folder Structure

Example frontend structure:

apps/web/

components/
features/
services/
hooks/
lib/

Keep domain logic grouped inside **features** when appropriate.

---

# Performance Guidelines

Prioritize performance by:

- minimizing unnecessary re-renders
- using memoization when needed
- leveraging server components
- using TanStack Query caching

---

# Realtime Updates

Realtime updates are handled using **SignalR**.

Use a dedicated realtime service to manage connections.

Example:

services/realtimeService.ts

Components should subscribe to events rather than manage websocket connections directly.

---

# Code Quality

Follow these principles:

- descriptive variable names
- small components
- reusable hooks
- clear separation of concerns

Avoid:

- very large components
- duplicated logic
- deeply nested JSX

---

# Design System Standards

These rules apply to all UI work in `apps/web`. Follow them whenever writing or reviewing component styles.

Reference: `docs/design-system.md`

## Color Tokens (defined in `globals.css`)

| Token                 | Variable           | Hex       | Use                          |
| --------------------- | ------------------ | --------- | ---------------------------- |
| `bg-background`       | `--background`     | `#0F1117` | Page background              |
| `bg-surface`          | `--surface`        | `#171A21` | Sidebar, elevated panels     |
| `bg-card`             | `--card`           | `#1E222D` | Cards, dialogs               |
| `bg-primary`          | `--primary`        | `#4F7FFF` | Primary accent, CTA          |
| `bg-primary-hover`    | `--primary-hover`  | `#3A6AEE` | Hover state                  |
| `text-success`        | `--success`        | `#22C55E` | Positive values, gains       |
| `text-danger`         | `--danger`         | `#EF4444` | Errors, losses, sells        |
| `text-warning`        | `--warning`        | `#F59E0B` | Warnings                     |
| `text-text-primary`   | `--text-primary`   | `#E6E8EE` | Primary body text, headings  |
| `text-text-secondary` | `--text-secondary` | `#9CA3AF` | Secondary text, descriptions |
| `text-muted`          | `--muted`          | `#6B7280` | Muted text, meta info        |
| `border-border`       | `--border`         | `#2A2F3A` | Card and input borders       |
| `border-border-hover` | `--border-hover`   | `#3A4050` | Hover borders                |

**Rules:**

- Never use raw hex or rgb values — always use token-based Tailwind classes
- `text-text-primary` for all primary labels, headings, and values
- `text-text-secondary` for secondary/supporting text
- `text-muted` for meta info only, never for primary content

## Typography

| Scale     | Class        | Size | Weight         |
| --------- | ------------ | ---- | -------------- |
| Heading 1 | `text-h1`    | 32px | Bold (700)     |
| Heading 2 | `text-h2`    | 24px | Semibold (600) |
| Heading 3 | `text-h3`    | 20px | Semibold (600) |
| Body      | `text-body`  | 14px | Regular (400)  |
| Small     | `text-small` | 12px | Regular (400)  |

Primary font: **Inter** (loaded via `next/font/google`).

## Component Styling Rules

All components must follow:

| Rule          | Value                                     |
| ------------- | ----------------------------------------- |
| Border radius | `rounded-xl` (0.75rem)                    |
| Borders       | `border border-border`                    |
| Shadow        | `shadow-sm`                               |
| Transitions   | `transition-all duration-150 ease-in-out` |
| Hover         | subtle elevation + color shift            |

## Utility Classes (defined in `globals.css`)

- `.stoxly-card` — standard card with theme bg, border, shadow, hover
- `.glass-card` — backdrop-blur card for auth pages
- `.btn-primary` / `.btn-secondary` / `.btn-danger` / `.btn-ghost` — button variants
- `.stoxly-input` — themed input field
- `.trend-up` / `.trend-down` / `.trend-neutral` — trend color indicators

## Spacing Scale

| Context            | Class       |
| ------------------ | ----------- |
| Card inner padding | `p-5`       |
| Section gap        | `space-y-6` |
| Grid gap           | `gap-4`     |
| Page padding       | `px-6 py-6` |
| Label → input gap  | `space-y-2` |

## Layout Structure

- **Dashboard:** Uses `app/(dashboard)/layout.tsx` — sidebar (240px, fixed) + top nav (sticky) + main content (max 1440px).
- **Auth pages:** Centered `glass-card` on `bg-background` with subtle gradient blob.
- All dashboard pages must be inside the `(dashboard)` route group.

## Do NOT

- Use hardcoded colors (hex, rgb, hsl) — use Tailwind theme tokens
- Use inline styles
- Override card padding with smaller values
- Use neon/glow effects — keep the UI clean and minimal
- Skip transitions on interactive elements
