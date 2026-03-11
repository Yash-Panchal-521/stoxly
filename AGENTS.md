# AGENTS.md

## Purpose

This file defines how AI agents (Copilot, ChatGPT, AI assistants) should behave when contributing to the Stoxly codebase.

AI agents should act as **experienced senior engineers** who prioritize maintainability, clarity, and architectural consistency.

---

# Project Overview

Stoxly is a **stock portfolio management platform** that allows users to:

- Track their stock portfolio
- Simulate buy/sell trades
- Monitor real-time price updates
- Analyze portfolio performance
- Maintain a watchlist of stocks

The system focuses on **real-time updates, performance, and scalable architecture**.

---

# Technology Stack

Frontend

- Next.js (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- SignalR client

Backend

- ASP.NET Core (.NET 8)
- SignalR for realtime updates
- Entity Framework Core

Infrastructure

- PostgreSQL
- Redis
- Azure (backend services)
- Vercel (frontend deployment)

---

# Architecture Principles

AI agents must follow these principles when generating code.

### 1. Clean Architecture

Backend code should follow a clear separation of concerns:

Controllers
→ handle HTTP requests

Services
→ contain business logic

Repositories
→ handle database interactions

Avoid placing business logic inside controllers.

---

### 2. Thin Controllers

Controllers should:

- validate input
- call services
- return responses

Controllers should **never contain complex logic**.

---

### 3. Strong Typing

- Always use TypeScript types on frontend
- Always use strongly typed models in backend
- Avoid using `any`

---

### 4. Reusable Code

Before writing new code:

- check existing services
- reuse utilities
- avoid duplication

---

### 5. Readability Over Cleverness

Prefer:

- simple logic
- descriptive variable names
- smaller functions

Avoid overly clever or complex implementations.

---

# Backend Development Guidelines

Framework: ASP.NET Core (.NET 8)

Structure:

/apps/api
Controllers
Services
Repositories
Models
Hubs
DTOs

Rules:

- Use DTOs for API responses
- Never expose database entities directly
- Business logic must live inside services
- Use dependency injection

Realtime:

SignalR should be used for:

- stock price updates
- portfolio value updates
- watchlist updates

---

# Frontend Development Guidelines

Framework: Next.js (App Router)

Rules:

- Prefer server components when possible
- Use TanStack Query for API calls
- Avoid unnecessary client-side state
- Use shadcn/ui components for UI
- **All UI must follow the Stoxly Design System** (see `docs/design-system.md`)

State Management:

Server state → TanStack Query
UI state → Zustand

Design System Rules:

- Never use hardcoded hex/rgb/hsl values — use Tailwind theme tokens
- Use typography scale classes: `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-small`
- Use utility classes: `.stoxly-card`, `.glass-card`, `.btn-primary`, `.stoxly-input`
- Use `rounded-xl`, `border border-border`, `shadow-sm`, `transition-all duration-150 ease-in-out`
- Dashboard pages must use the `(dashboard)` route group layout
- Auth pages use centered `glass-card` layout

---

# Database Guidelines

Database: PostgreSQL

Rules:

- Use EF Core migrations
- Use proper indexing for performance
- Avoid raw SQL unless necessary
- Maintain clear relational integrity

Tables include:

users
stocks
portfolios
holdings
transactions
watchlists
price_history

---

# Real-Time System

Real-time updates must use **SignalR**.

Typical flow:

Market data source
→ backend service updates prices
→ SignalR pushes updates
→ frontend updates UI

Realtime updates must be **efficient and minimal**.

---

# Performance Guidelines

AI agents should prioritize:

- minimal API calls
- efficient queries
- caching where appropriate
- avoiding unnecessary re-renders

Redis may be used for:

- caching stock prices
- reducing database load

---

# Code Quality

AI agents should:

- keep functions small
- maintain consistent naming
- write clear comments when logic is complex

Avoid:

- deeply nested logic
- extremely long files
- duplicated code

---

# Documentation Expectations

When adding significant features, update:

- ARCHITECTURE.md
- API.md
- DATABASE.md

---

# What AI Should Do Before Writing Code

Before generating code:

1. Understand the existing architecture
2. Search for existing patterns in the repository
3. Reuse existing utilities
4. Follow established folder structure

---

# What AI Should Avoid

AI agents should NOT:

- introduce new frameworks without justification
- break architectural patterns
- duplicate logic
- create overly complex abstractions

---

# Goal

The goal of this repository is to maintain a **clean, scalable, and production-grade architecture** that demonstrates strong full-stack engineering practices.
