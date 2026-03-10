# Stoxly Architecture

## Overview

Stoxly is a full-stack stock portfolio management platform designed to demonstrate modern software architecture, real-time data systems, and scalable backend design.

The platform allows users to:

- Track their stock portfolio
- Simulate buy/sell transactions
- Monitor portfolio performance
- Receive real-time stock price updates
- Maintain a watchlist

Authentication is handled through Firebase Authentication. The frontend signs users in with Firebase and the backend verifies Firebase ID tokens without storing passwords.

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

Authentication flow:

User
→ Next.js frontend
→ Firebase Authentication
→ ID token issued
→ token sent to backend API
→ ASP.NET Core verifies token
→ backend processes request

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
- Firebase SDK

Data Flow:

Frontend
→ API request
→ Backend processes request
→ Response returned
→ UI updates via React Query

Authentication Flow:

Frontend
→ Firebase Authentication sign-in
→ Firebase ID token returned
→ token included in Authorization header
→ backend verifies token before processing protected requests

---

# Backend Architecture

Framework: ASP.NET Core (.NET 8)

Backend responsibilities:

- portfolio management
- trade simulation
- stock data storage
- real-time updates
- Firebase JWT verification for protected API requests

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

Authentication rules:

- the backend does not store passwords
- the backend does not manage login or registration flows
- ASP.NET Core only verifies Firebase JWT tokens from the Authorization header
- verified Firebase claims, especially `uid` and `email`, identify the user in the Stoxly database

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

Users are linked to Firebase identities through `firebase_uid` instead of application-managed password credentials.

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
