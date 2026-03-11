# GitHub Copilot Instructions for Stoxly

## Project Overview

Stoxly is a stock portfolio management platform that allows users to track stock holdings, simulate trades, and monitor portfolio performance with real-time price updates.

The system is designed to demonstrate modern full-stack engineering practices including real-time systems, scalable architecture, and clean code principles.

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
- Entity Framework Core
- SignalR for realtime communication

Infrastructure

- PostgreSQL
- Redis
- Azure (backend services)
- Vercel (frontend deployment)

---

# Monorepo Structure

The repository follows a monorepo architecture.

apps/

- web → Next.js frontend
- api → ASP.NET Core backend

services/

- market-worker → background worker for stock data

packages/

- shared-types → shared TypeScript types

docs/

- project documentation

---

# Backend Coding Guidelines

Framework: ASP.NET Core (.NET 8)

Guidelines:

- Use RESTful API design
- Controllers should remain thin
- Business logic must live inside services
- Use dependency injection
- Use DTOs for request and response models
- Do not expose database entities directly

Database Access

- Use Entity Framework Core
- Prefer LINQ queries
- Avoid raw SQL unless necessary
- Use migrations for schema updates

---

# Frontend Coding Guidelines

Framework: Next.js (App Router)

Guidelines:

- Use server components when possible
- Use client components only when required
- Use TanStack Query for API communication
- Avoid unnecessary global state
- Keep components small and reusable

UI

- Use TailwindCSS
- Use shadcn/ui components
- Maintain consistent spacing and layout patterns
- Follow the Stoxly design system (see `docs/design-system.md`)

---

# Stoxly Design System

All generated UI code must follow the Stoxly design system.

## Color Variables

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens in `tailwind.config.ts`.

Key tokens:

- Backgrounds: `bg-background` (#0F1117), `bg-surface` (#171A21), `bg-card` (#1E222D)
- Primary: `bg-primary` (#4F7FFF), `hover:bg-primary-hover` (#3A6AEE)
- Semantic: `text-success` (#22C55E), `text-danger` (#EF4444), `text-warning` (#F59E0B)
- Text: `text-text-primary` (#E6E8EE), `text-text-secondary` (#9CA3AF), `text-muted` (#6B7280)
- Borders: `border-border` (#2A2F3A), `border-border-hover` (#3A4050)

Rules:

- Never use hardcoded hex/rgb/hsl values in components
- Always use Tailwind theme token classes
- Use `text-text-primary` for headings and primary labels
- Use `text-text-secondary` for descriptions and secondary content

## Typography

Font: Inter. Use the predefined typography scale:

- `text-h1` (32px bold), `text-h2` (24px semibold), `text-h3` (20px semibold)
- `text-body` (14px), `text-small` (12px)

## Component Styling

- Border radius: `rounded-xl`
- Borders: `border border-border`
- Shadow: `shadow-sm`
- Transitions: `transition-all duration-150 ease-in-out`

## Utility Classes

Use these predefined utilities from `globals.css`:

- `.stoxly-card` — themed card
- `.glass-card` — backdrop-blur card for auth pages
- `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-ghost` — buttons
- `.stoxly-input` — form inputs
- `.trend-up`, `.trend-down`, `.trend-neutral` — stock trend colors

## Dashboard Layout

Dashboard pages must use the `(dashboard)` route group layout with:

- Fixed sidebar (240px)
- Sticky top navigation
- Content area max-width 1440px

## Auth Pages

Auth pages use a centered glass-card layout with a subtle gradient background.

---

# Real-Time Updates

Realtime communication must use **SignalR**.

SignalR should be used for:

- stock price updates
- portfolio value updates
- watchlist updates

Avoid polling when realtime updates are available.

---

# Database Guidelines

Database: PostgreSQL

Tables include:

- users
- stocks
- portfolios
- holdings
- transactions
- watchlists
- price_history

Guidelines:

- enforce relational integrity
- use proper indexing
- avoid unnecessary joins

---

# Performance Guidelines

Prioritize performance by:

- minimizing database queries
- caching frequently accessed data
- reducing frontend re-renders
- using Redis for caching where appropriate

---

# Code Style

General rules:

- prefer descriptive variable names
- avoid large functions
- keep files focused on a single responsibility
- write readable and maintainable code

Avoid:

- deeply nested logic
- unnecessary abstractions
- duplicate code

---

# When Generating Code

Before generating new code:

1. Look for existing services or utilities that can be reused
2. Follow the existing folder structure
3. Maintain consistent naming conventions
4. Avoid introducing new libraries unless necessary

---

# Documentation Expectations

When implementing major features, update relevant documentation files:

- docs/ARCHITECTURE.md
- docs/API.md
- docs/DATABASE.md

---

# Goal

Maintain a production-quality codebase that demonstrates strong full-stack engineering practices, scalability, and clean architecture.
