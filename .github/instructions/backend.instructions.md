## applyTo: apps/api/\*\*

# Backend Development Instructions – Stoxly

These instructions apply to the **ASP.NET Core backend API**.

## Framework

Backend uses:

- ASP.NET Core (.NET 8)
- Entity Framework Core
- PostgreSQL
- Redis
- SignalR

The backend should follow **Clean Architecture principles**.

---

# Architecture Layers

The backend should be organized into these layers:

Controllers
Services
Repositories
Models
DTOs
Hubs

Each layer has a specific responsibility.

---

# Controllers

Controllers should:

- handle HTTP requests
- validate input
- call services
- return responses

Controllers must **not contain business logic**.

---

# Services

Services contain the business logic of the application.

Examples:

PortfolioService
TradeService
StockService

Services should:

- orchestrate operations
- call repositories
- enforce business rules

---

# Repositories

Repositories are responsible for:

- database queries
- entity persistence
- data retrieval

Repositories should **not contain business logic**.

---

# DTO Usage

Always use **DTOs** for API responses.

Never expose database entities directly through controllers.

Example DTOs:

PortfolioDto
StockDto
TransactionDto

---

# Database Access

Database operations should use **Entity Framework Core**.

Guidelines:

- prefer LINQ queries
- use migrations for schema changes
- avoid raw SQL unless necessary

---

# Realtime System

Realtime updates use **SignalR**.

SignalR hubs are responsible for broadcasting:

- price updates
- portfolio updates
- watchlist updates

Hubs should remain lightweight and delegate logic to services.

---

# Error Handling

All API errors should follow a consistent structure.

Example:

{
"error": "invalid_request",
"message": "Portfolio not found"
}

Avoid exposing internal exceptions to clients.

---

# Logging

Backend services should log important events such as:

- trade execution
- authentication attempts
- unexpected errors

Use structured logging where possible.

---

# Performance Guidelines

Optimize backend performance by:

- minimizing database queries
- using proper indexing
- caching frequently accessed data with Redis
- avoiding unnecessary data loading

---

# Code Quality

Follow these principles:

- descriptive method names
- small focused services
- clear separation of concerns
- reusable utility functions

Avoid:

- large service classes
- duplicated logic
- complex nested conditionals
