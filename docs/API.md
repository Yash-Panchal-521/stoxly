# Stoxly API Specification

## Overview

The Stoxly backend exposes a REST API used by the frontend to manage:

- authentication
- portfolios
- trades
- watchlists
- stock data

The API is implemented using **ASP.NET Core (.NET 8)**.

Base URL (development):

```
http://localhost:5000/api
```

---

# Authentication

Authentication uses **JWT tokens**.

## Login

POST `/api/auth/login`

Request

```
{
  "email": "user@example.com",
  "password": "password"
}
```

Response

```
{
  "token": "jwt-token",
  "expiresAt": "timestamp"
}
```

---

## Register

POST `/api/auth/register`

Request

```
{
  "email": "user@example.com",
  "username": "yash",
  "password": "password"
}
```

Response

```
{
  "userId": "uuid"
}
```

---

# Portfolio API

## Get User Portfolios

GET `/api/portfolios`

Returns all portfolios owned by the authenticated user.

Response

```
[
  {
    "id": "uuid",
    "name": "Main Portfolio",
    "createdAt": "timestamp"
  }
]
```

---

## Create Portfolio

POST `/api/portfolios`

Request

```
{
  "name": "Long Term Portfolio"
}
```

Response

```
{
  "id": "uuid",
  "name": "Long Term Portfolio"
}
```

---

## Get Portfolio Details

GET `/api/portfolios/{portfolioId}`

Response

```
{
  "id": "uuid",
  "name": "Main Portfolio",
  "holdings": []
}
```

---

# Holdings API

## Get Holdings

GET `/api/portfolios/{portfolioId}/holdings`

Response

```
[
  {
    "stockSymbol": "AAPL",
    "quantity": 10,
    "averagePrice": 150
  }
]
```

---

# Transactions API

## Buy Stock

POST `/api/trades/buy`

Request

```
{
  "portfolioId": "uuid",
  "stockSymbol": "AAPL",
  "quantity": 10,
  "price": 150
}
```

---

## Sell Stock

POST `/api/trades/sell`

Request

```
{
  "portfolioId": "uuid",
  "stockSymbol": "AAPL",
  "quantity": 5,
  "price": 155
}
```

---

## Transaction History

GET `/api/portfolios/{portfolioId}/transactions`

Response

```
[
  {
    "type": "BUY",
    "stockSymbol": "AAPL",
    "quantity": 10,
    "price": 150,
    "executedAt": "timestamp"
  }
]
```

---

# Watchlist API

## Get Watchlist

GET `/api/watchlist`

Response

```
[
  {
    "symbol": "AAPL",
    "companyName": "Apple Inc."
  }
]
```

---

## Add Stock to Watchlist

POST `/api/watchlist`

Request

```
{
  "symbol": "TSLA"
}
```

---

## Remove from Watchlist

DELETE `/api/watchlist/{symbol}`

---

# Stocks API

## Search Stocks

GET `/api/stocks/search?q=AAPL`

Response

```
[
  {
    "symbol": "AAPL",
    "companyName": "Apple Inc."
  }
]
```

---

## Get Stock Details

GET `/api/stocks/{symbol}`

Response

```
{
  "symbol": "AAPL",
  "companyName": "Apple Inc.",
  "price": 175
}
```

---

# Price History

## Get Historical Prices

GET `/api/stocks/{symbol}/history`

Response

```
[
  {
    "price": 170,
    "timestamp": "2025-01-01"
  }
]
```

---

# Real-Time Events (SignalR)

SignalR hub endpoint:

```
/hubs/market
```

Events emitted by the server:

priceUpdated

```
{
  "symbol": "AAPL",
  "price": 176
}
```

portfolioUpdated

```
{
  "portfolioId": "uuid",
  "newValue": 12000
}
```

---

# Error Response Format

All API errors follow this structure:

```
{
  "error": "error_code",
  "message": "Human readable message"
}
```

---

# API Design Principles

The API follows these principles:

- RESTful endpoints
- clear resource naming
- consistent response formats
- strong typing through DTOs

Controllers should remain thin and delegate logic to services.
