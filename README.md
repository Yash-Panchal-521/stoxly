# Stoxly

Stoxly is a **modern stock portfolio management platform** that allows users to simulate stock trading, track portfolio performance, and monitor stock prices with real-time updates.

The project is designed to demonstrate **production-grade full-stack architecture**, including real-time systems, scalable backend services, and modern frontend development.

---

# Key Features

- Portfolio tracking
- Simulated stock trading (buy/sell)
- Real-time stock price updates
- Watchlist management
- Portfolio analytics
- Historical price charts

---

# Tech Stack

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
- SignalR

Infrastructure

- PostgreSQL
- Redis
- Azure (backend hosting)
- Vercel (frontend hosting)

---

# Monorepo Structure

The project uses a **monorepo architecture**.

```
stoxly/

apps/
  web/            # Next.js frontend
  api/            # ASP.NET Core backend

services/
  market-worker/  # background market data worker

packages/
  shared-types/   # shared types

docs/             # architecture & system documentation
```

---

# Architecture Overview

The system is composed of three primary layers.

User
→ Next.js Frontend
→ ASP.NET Core API
→ PostgreSQL Database

Real-time updates are handled through **SignalR**.

Stock price updates are pushed to connected clients instantly.

---

# Real-Time System

Stoxly uses **SignalR** to provide live updates for:

- stock prices
- portfolio value changes
- watchlist updates

Update flow:

Market Data
→ Backend updates cache/database
→ SignalR broadcasts event
→ Frontend updates UI

---

# Getting Started

## Clone Repository

```
git clone https://github.com/your-username/stoxly.git
cd stoxly
```

---

## Start Backend

```
cd apps/api
dotnet run
```

Backend runs on:

```
http://localhost:5000
```

---

## Start Frontend

```
cd apps/web
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

---

# Documentation

Detailed documentation is available in the `docs` directory.

Important documents include:

- Architecture
- Database design
- API specification
- Real-time system
- Deployment guide

---

# Project Goals

The goal of Stoxly is to demonstrate strong engineering practices including:

- clean architecture
- real-time system design
- scalable backend development
- modern frontend architecture
- cloud deployment patterns

---

# Future Improvements

- advanced portfolio analytics
- dividend tracking
- multi-exchange support
- improved charting features
- mobile application

---
