# Stoxly Architecture

## Overview

Stoxly is a full-stack stock portfolio management platform designed to demonstrate modern software architecture, real-time data systems, and scalable backend design.

The platform allows users to:

- Track their stock portfolio
- Simulate buy/sell transactions
- Monitor portfolio performance
- Receive real-time stock price updates
- Maintain a watchlist

---

# System Architecture

The system consists of three main layers:

1. Frontend Application
2. Backend API
3. Data & Infrastructure Services

High-level architecture:

User
→ Next.js Frontend
→ ASP.NET Core API
→ PostgreSQL Database

Realtime updates flow through SignalR.

---

# Monorepo Structure

The repository uses a monorepo layout.

```
stoxly/
  apps/
    web/        → Next.js frontend
    api/        → ASP.NET Core API

  services/
    market-worker/  → background service for stock data

  packages/
    shared-types/   → shared TypeScript types

  docs/
    architecture and project documentation
```

---

# Frontend Architecture

Framework: Next.js (App Router)

Responsibilities:

- UI rendering
- portfolio dashboard
- trade interface
- watchlist management
- real-time price display

Key technologies:

- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- SignalR client

Data Flow:

Frontend
→ API request
→ Backend processes request
→ Response returned
→ UI updates via React Query

---

# Backend Architecture

Framework: ASP.NET Core (.NET 8)

Backend responsibilities:

- authentication
- portfolio management
- trade simulation
- stock data storage
- real-time updates

Backend structure:

```
Controllers
Services
Repositories
Models
DTOs
Hubs
```

Layer responsibilities:

Controllers
Handle HTTP requests.

Services
Contain business logic.

Repositories
Handle database operations.

Hubs
Provide SignalR realtime communication.

---

# Real-Time System

Realtime updates use **SignalR**.

Realtime events include:

- stock price updates
- portfolio value changes
- watchlist updates

Realtime flow:

Market data source
→ backend updates stock price
→ SignalR hub broadcasts update
→ frontend receives event
→ UI updates immediately

---

# Market Data Worker

A background worker service fetches market data.

Responsibilities:

- fetch stock prices from external APIs
- update price data
- trigger realtime updates

This worker runs independently of the main API.

---

# Database Architecture

Database: PostgreSQL

Core entities:

users
stocks
portfolios
holdings
transactions
watchlists
price_history

Relationships:

User → Portfolio
Portfolio → Holdings
Holding → Stock

Transactions record buy and sell events.

---

# Caching Layer

Redis is used for:

- caching frequently accessed stock prices
- reducing database load
- improving response performance

---

# Deployment Architecture

Frontend

Deployed on **Vercel**.

Backend

Deployed on **Azure App Service**.

Infrastructure

Azure PostgreSQL → database
Azure Redis → caching

---

# Scalability Considerations

The system is designed to scale by:

- separating frontend and backend services
- using Redis caching
- handling realtime communication via SignalR
- allowing background workers to scale independently

---

# Architectural Goals

The architecture prioritizes:

- clear separation of concerns
- scalability
- performance
- maintainability
- modern full-stack practices
