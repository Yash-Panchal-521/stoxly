# Stoxly API Specification

## Overview

The Stoxly backend exposes a REST API used by the frontend to manage:

- portfolios
- transactions
- holdings
- market data (symbol search, stock prices)

The API is implemented using **ASP.NET Core (.NET 8)**.

Base URL (development):

```
http://localhost:5000/api
```

---

# Authentication

Authentication is handled by **Firebase Authentication**.

The Next.js frontend signs users in with Firebase and receives a Firebase ID token. That token must be sent with every protected API request.

Example header:

```
Authorization: Bearer <firebase-id-token>
```

API rules:

- the backend does not expose login or registration endpoints
- the backend never manages passwords
- ASP.NET Core only verifies Firebase JWT tokens
- protected endpoints use the verified `uid` claim to resolve the Stoxly user record

---

# Portfolio API

## Get User Portfolios

GET `/api/portfolios`

Requires a valid Firebase ID token.

Response

```json
[
  {
    "id": "uuid",
    "name": "Main Portfolio",
    "description": null,
    "baseCurrency": "USD",
    "isDefault": true,
    "createdAt": "2026-03-11T10:00:00Z"
  }
]
```

---

## Create Portfolio

POST `/api/portfolios`

Request

```json
{
  "name": "Long Term Portfolio",
  "description": "Optional description",
  "baseCurrency": "USD"
}
```

Response `201 Created`

```json
{
  "id": "uuid",
  "name": "Long Term Portfolio"
}
```

---

## Get Portfolio Details

GET `/api/portfolios/{portfolioId}`

Response `200 OK`

```json
{
  "id": "uuid",
  "name": "Main Portfolio",
  "baseCurrency": "USD",
  "isDefault": true,
  "createdAt": "2026-03-11T10:00:00Z"
}
```

---

## Update Portfolio

PUT `/api/portfolios/{portfolioId}`

Request

```json
{
  "name": "Renamed Portfolio"
}
```

---

## Delete Portfolio

DELETE `/api/portfolios/{portfolioId}`

Response `204 No Content`

---

# Holdings API

## Get Holdings

GET `/api/portfolios/{portfolioId}/holdings`

Requires a valid Firebase ID token.

Holdings are calculated on-the-fly from transaction history using FIFO cost basis.

Response `200 OK`

```json
[
  {
    "symbol": "AAPL",
    "quantity": 10,
    "averagePrice": 150.0,
    "totalInvested": 1500.0,
    "realizedProfit": 0.0
  }
]
```

---

# Transactions API

## Get Transactions

GET `/api/portfolios/{portfolioId}/transactions`

Requires a valid Firebase ID token.

Response `200 OK`

```json
[
  {
    "id": "uuid",
    "symbol": "AAPL",
    "type": "BUY",
    "quantity": 10,
    "price": 150.0,
    "fee": 0.0,
    "tradeDate": "2026-01-15",
    "notes": null,
    "createdAt": "2026-03-11T10:00:00Z"
  }
]
```

---

## Create Transaction

POST `/api/portfolios/{portfolioId}/transactions`

Requires a valid Firebase ID token.

The `symbol` must already exist in the `symbols` table. Use the market search endpoint to register a symbol before submitting a transaction.

Request

```json
{
  "symbol": "AAPL",
  "type": "BUY",
  "quantity": 10,
  "price": 150.0,
  "fee": 0.0,
  "tradeDate": "2026-01-15",
  "notes": "Optional note"
}
```

Validation rules:

- `symbol` — required, matches `^[A-Za-z0-9.\-]{1,20}$`, must exist in symbols table
- `type` — `BUY` or `SELL`
- `quantity` — decimal, > 0
- `price` — decimal, > 0
- `fee` — decimal, ≥ 0, optional
- `tradeDate` — ISO 8601 date

Response `201 Created`

---

## Update Transaction

PUT `/api/portfolios/{portfolioId}/transactions/{transactionId}`

Request body: same shape as create.

Response `200 OK`

---

## Delete Transaction

DELETE `/api/portfolios/{portfolioId}/transactions/{transactionId}`

Response `204 No Content`

---

# Market Data API

## Get Stock Price

GET `/api/market/price/{symbol}`

Requires a valid Firebase ID token.

Returns the latest price. Checks Redis first (`stock:price:{SYMBOL}`, 60 s TTL); falls back to Finnhub.

Response `200 OK`

```json
{
  "symbol": "AAPL",
  "currentPrice": 211.45,
  "change": 1.25,
  "changePercent": 0.59,
  "highPrice": 213.0,
  "lowPrice": 209.5,
  "openPrice": 210.0,
  "previousClose": 210.2,
  "timestamp": "2026-03-12T15:30:00Z"
}
```

Returns `404 Not Found` if the symbol is not recognised by Finnhub.

---

## Get Multiple Stock Prices

POST `/api/market/prices`

Requires a valid Firebase ID token.

Request

```json
["AAPL", "MSFT", "TSLA"]
```

Response `200 OK` — array of the same price objects. Symbols with no data are omitted.

---

## Search Symbols

GET `/api/market/search?q={query}`

Requires a valid Firebase ID token.

Rate limited: 30 requests per minute per IP. Returns HTTP 429 when exceeded.

Validation:

- `q` — required, 1–50 characters, matches `^[\p{L}\p{N}\s.\-]+$`

Search strategy: local `symbols` table first (ILike), Finnhub fallback when fewer than 5 local results. Finnhub results are persisted into the `symbols` table for future lookups.

Response `200 OK`

```json
[
  {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "exchange": "NASDAQ"
  }
]
```

---

# Real-Time Events (SignalR)

SignalR hub endpoint:

```
/hubs/prices
```

WebSocket transport. Use `@microsoft/signalr` on the frontend.

## Client → Server methods

### SubscribeToSymbol

```
connection.invoke("SubscribeToSymbol", "AAPL")
```

Joins the client to the `price:AAPL` group. The client will receive `PriceUpdated` events for that symbol.

### UnsubscribeFromSymbol

```
connection.invoke("UnsubscribeFromSymbol", "AAPL")
```

## Server → Client events

### PriceUpdated

Broadcast every 30 seconds by `PriceUpdateWorker` to all subscribers of a symbol group.

```json
{
  "symbol": "AAPL",
  "price": 211.45,
  "change": 1.25,
  "changePercent": 0.59,
  "updatedAt": "2026-03-12T15:30:00Z"
}
```

---

# Error Response Format

All API errors follow this structure:

```json
{
  "error": "error_code",
  "message": "Human readable message"
}
```

Common status codes:

| Code | Meaning                                                   |
| ---- | --------------------------------------------------------- |
| 400  | Validation failure or business rule violation             |
| 401  | Missing or invalid Firebase token                         |
| 403  | Authenticated but not authorised for resource             |
| 404  | Resource not found                                        |
| 429  | Rate limit exceeded                                       |
| 500  | Unhandled server error (logged, generic message returned) |

---

# API Design Principles

- RESTful endpoints with clear resource naming
- Thin controllers — all logic in services
- DTOs for all request and response shapes
- No direct entity exposure
- Consistent error format via `ExceptionHandlingMiddleware`

---

# Authentication

Authentication is handled by **Firebase Authentication**.

The Next.js frontend signs users in with Firebase and receives a Firebase ID token. That token must be sent with every protected API request.

Example header:

```
Authorization: Bearer <firebase-id-token>
```

API rules:

- the backend does not expose login or registration endpoints
- the backend never manages passwords
- ASP.NET Core only verifies Firebase JWT tokens
- protected endpoints use verified Firebase claims, especially `uid` and `email`, to resolve the Stoxly user record

---

# Portfolio API

## Get User Portfolios

GET `/api/portfolios`

Returns all portfolios owned by the authenticated user.

Requires a valid Firebase ID token in the Authorization header.

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

Requires a valid Firebase ID token in the Authorization header.

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

Requires a valid Firebase ID token in the Authorization header.

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

Requires a valid Firebase ID token in the Authorization header.

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

Requires a valid Firebase ID token in the Authorization header.

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

Requires a valid Firebase ID token in the Authorization header.

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

Requires a valid Firebase ID token in the Authorization header.

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

Requires a valid Firebase ID token in the Authorization header.

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

Requires a valid Firebase ID token in the Authorization header.

Request

```
{
  "symbol": "TSLA"
}
```

---

## Remove from Watchlist

DELETE `/api/watchlist/{symbol}`

Requires a valid Firebase ID token in the Authorization header.

---

# Stocks API

## Search Stocks

GET `/api/stocks/search?q=AAPL`

Requires a valid Firebase ID token in the Authorization header.

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
