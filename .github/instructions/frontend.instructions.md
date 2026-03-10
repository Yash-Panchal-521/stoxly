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
