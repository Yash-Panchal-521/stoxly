# Coding Standards – Stoxly

## Overview

This document defines the coding standards and conventions used in the Stoxly codebase.

Following consistent coding standards ensures:

- readability
- maintainability
- predictable architecture
- high-quality code generation from AI tools

These guidelines apply to both frontend and backend development.

---

# General Principles

All code should follow these principles:

- prioritize readability over cleverness
- keep functions small and focused
- avoid duplication
- follow existing patterns in the repository

Before writing new code:

1. check if similar functionality already exists
2. reuse services or utilities when possible
3. follow the established architecture

---

# Naming Conventions

## Variables

Use descriptive variable names.

Good:

```
portfolioValue
stockPrice
transactionHistory
```

Avoid:

```
x
data
value
```

---

## Functions

Functions should describe their action clearly.

Good:

```
calculatePortfolioValue
getStockPrice
createTransaction
```

Avoid vague names.

---

## Classes

Class names should use **PascalCase**.

Examples:

```
PortfolioService
StockRepository
MarketHub
```

---

# Backend Standards (.NET)

Framework: ASP.NET Core (.NET 8)

Backend follows a layered structure.

```
Controllers
Services
Repositories
Models
DTOs
Hubs
```

---

## Controllers

Responsibilities:

- receive HTTP requests
- validate input
- call services
- return responses

Controllers must **not contain business logic**.

---

## Services

Services contain business logic.

Examples:

```
PortfolioService
TradeService
StockService
```

Services should remain independent of HTTP logic.

---

## Repositories

Repositories handle database operations.

Responsibilities:

- query database
- save entities
- maintain data integrity

Repositories should not contain business rules.

---

## DTOs

Use DTOs (Data Transfer Objects) for API responses.

Do not expose database entities directly.

Example:

```
PortfolioDto
StockDto
TransactionDto
```

---

# Frontend Standards (Next.js)

Framework: Next.js (App Router)

---

## Component Structure

Keep components small and reusable.

Example:

```
components/
  PortfolioCard
  StockSearch
  WatchlistItem
```

Avoid extremely large components.

---

## State Management

Use:

Server state → TanStack Query
UI state → Zustand

Avoid unnecessary global state.

---

## Styling

Use:

- TailwindCSS
- shadcn/ui components

Avoid:

- inline styles
- inconsistent spacing

---

# File Organization

Files should follow clear organization.

Example:

```
apps/
  web/
    components/
    pages/
    services/

  api/
    Controllers/
    Services/
    Repositories/
```

---

# Error Handling

Errors should be handled consistently.

Backend errors should return structured responses.

Example:

```
{
  "error": "invalid_request",
  "message": "Portfolio not found"
}
```

---

# Logging

Backend services should include logging for:

- critical operations
- unexpected errors
- important system events

---

# Code Reviews (Future)

All significant changes should be reviewed for:

- architecture consistency
- performance impact
- readability
- duplication

---

# Documentation

When adding major features, update relevant documentation:

- ARCHITECTURE.md
- API.md
- DATABASE.md
- FEATURES.md
