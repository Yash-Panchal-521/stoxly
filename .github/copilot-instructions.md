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
