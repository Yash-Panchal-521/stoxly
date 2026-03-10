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

## Color Tokens (defined in `globals.css`)

| Token              | Value                   | Use                                    |
| ------------------ | ----------------------- | -------------------------------------- |
| `--foreground`     | `#ebfcff`               | Primary body text, headings, labels    |
| `--muted`          | `#a0b8c6`               | Secondary text, descriptions, captions |
| `--primary`        | `#22d3ee`               | Cyan accent, links, active states      |
| `--background`     | `#020508`               | Page background                        |
| `--surface`        | `rgba(5,14,19,0.84)`    | Panel backgrounds                      |
| `--surface-strong` | `rgba(8,20,27,0.96)`    | Card interiors, table rows             |
| `--border`         | `rgba(34,211,238,0.18)` | Card and input borders                 |
| `--success`        | `#34d399`               | Positive values, gains                 |
| `--danger`         | `#fb7185`               | Errors, losses                         |

**Rules:**

- Never use raw hex or rgb values in component classes — always use token-based Tailwind classes (`text-foreground`, `text-muted`, `bg-surface`, etc.)
- `text-muted` must only be used for secondary/supporting text, never for primary content
- Never use `text-xs` with `text-muted` on critical UI text; use `text-sm` minimum for readable labels
- `text-foreground` must be used for all primary labels, headings, and values

## Text Contrast Requirements

- All body text must satisfy WCAG AA contrast (≥ 4.5:1 for text < 18px)
- `--muted` (`#a0b8c6`) on `--background` (`#020508`) passes AA at ~8.5:1
- Never introduce a new muted-style color darker than `#8aacbb` on the dark background

## Spacing Scale

Use consistent spacing increments. Preferred values:

| Context                      | Class                                      |
| ---------------------------- | ------------------------------------------ |
| Between form fields          | `space-y-6`                                |
| Label → input gap            | `space-y-2.5`                              |
| Card inner padding           | `p-6 sm:p-8` (applied by `Card` component) |
| Card header items            | `space-y-3` (applied by `CardHeader`)      |
| Card header → content gap    | `mt-6 sm:mt-8` (applied by `CardContent`)  |
| Section banner padding       | `px-8 py-7` minimum                        |
| AppShell inner panel         | `px-8 py-8 sm:px-10 lg:px-12`              |
| Page vertical padding (auth) | `py-12 sm:py-16`                           |

## Component Padding Rules

- **`Card`** — Default padding is `p-6 sm:p-8`. Do not override padding with smaller values (e.g., `px-1`, `p-2`).
- **`Input`** — Height `h-12`, horizontal padding `px-4`. Do not reduce.
- **`Button` (default)** — Height `h-11`, padding `px-4 py-2`.
- Do not add `overflow-hidden` to outer layout containers without a specific reason; it can clip focus rings.

## Layout Patterns

- Auth pages: full-height two-column layout. Left = marketing/context panel. Right = dark Card with form.
- Dashboard: `AppShell` wraps all content in a `surface-panel` with a grid-accent background.
- Section panels inside the dashboard use `rounded-[28px] border border-border bg-surface-strong/80` with `px-8 py-7`.

## Duplicate Navigation Links

- Auth page navigation links (e.g., "Need an account? Register") belong in `AuthShell`, not inside form components.
- `EmailPasswordForm` must not render its own alternate-page links; `AuthShell` handles that via `alternateHref`/`alternateLabel` props.

## Neon / Glow Effects

- **`.neon-border`** — Subtle cyan border + glow. Applied by default in `Card`.
- **`.neon-text`** — Cyan text shadow for hero headings only. Do not apply to body text.
- Glow blobs (absolute positioned, blurred) are decorative and must use `pointer-events-none`.
- Keep glow effects subtle: do not exceed `opacity-20` / `blur-3xl` for ambient blobs.
