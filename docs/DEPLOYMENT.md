# Deployment Guide – Stoxly

## Overview

Stoxly is deployed using a modern cloud architecture.

Frontend is deployed separately from the backend to allow independent scaling and optimized performance.

Deployment targets:

Frontend → Vercel
Backend → Azure App Service
Database → Azure PostgreSQL
Cache → Azure Redis

---

# Local Development Setup

## Prerequisites

Install the following tools:

- Node.js (v18+)
- .NET SDK 8
- Docker (optional but recommended)
- PostgreSQL
- Redis

---

## Clone Repository

```
git clone https://github.com/your-username/stoxly.git
cd stoxly
```

---

## Environment Variables

Create environment files for each service.

### Backend (.NET API)

Location:

```
apps/api/appsettings.Development.json
```

Example configuration:

```
{
  "ConnectionStrings": {
    "Postgres": "Host=localhost;Database=stoxly;Username=postgres;Password=password"
  },
  "Redis": {
    "ConnectionString": "localhost:6379"
  },
  "Jwt": {
    "Secret": "your-secret-key"
  }
}
```

---

### Frontend (Next.js)

Location:

```
apps/web/.env.local
```

Example:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SIGNALR_URL=http://localhost:5000/hubs/market
```

---

# Running the Application Locally

## Start Database

If using Docker:

```
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres
```

Start Redis:

```
docker run -d -p 6379:6379 redis
```

---

## Start Backend

Navigate to API directory:

```
cd apps/api
dotnet run
```

Backend will run at:

```
http://localhost:5000
```

---

## Start Frontend

Navigate to web directory:

```
cd apps/web
npm install
npm run dev
```

Frontend will run at:

```
http://localhost:3000
```

---

# Production Deployment

## Frontend Deployment

Platform:

Vercel

Steps:

1. Connect GitHub repository
2. Select `apps/web` as project root
3. Configure environment variables
4. Deploy

Environment variables:

```
NEXT_PUBLIC_API_URL=https://api.stoxly.com
NEXT_PUBLIC_SIGNALR_URL=https://api.stoxly.com/hubs/market
```

---

## Backend Deployment

Platform:

Azure App Service

Steps:

1. Create Azure Web App
2. Configure runtime to .NET 8
3. Deploy using GitHub Actions or Azure CLI
4. Set environment variables

---

## Database

Platform:

Azure PostgreSQL

Configuration:

- create database
- configure connection string
- enable SSL

Example connection string:

```
Host=<host>;Database=stoxly;Username=<user>;Password=<password>
```

---

## Redis Cache

Platform:

Azure Redis Cache

Used for:

- caching stock prices
- improving API performance
- supporting realtime systems

---

# CI/CD (Future)

Automated deployment may include:

- GitHub Actions
- build verification
- automatic deployments to Vercel and Azure

Example pipeline steps:

1. Install dependencies
2. Build frontend
3. Build backend
4. Run migrations
5. Deploy services

---

# Scaling Strategy

The architecture allows scaling of services independently.

Frontend:

- CDN caching via Vercel

Backend:

- Azure App Service scaling

Realtime:

- SignalR scaling via Redis or Azure SignalR Service

---

# Monitoring (Future)

Possible monitoring tools:

- Azure Application Insights
- Grafana
- Prometheus

These tools can track:

- API performance
- database queries
- realtime event throughput
