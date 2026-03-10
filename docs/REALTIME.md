# Real-Time System – Stoxly

## Overview

Stoxly provides real-time updates for stock prices and portfolio values using **SignalR**.

Real-time updates allow the frontend dashboard to update instantly when stock prices change or when a portfolio value is recalculated.

The system is designed to minimize polling and reduce unnecessary API calls.

---

# Technology

Real-time communication is implemented using:

- **ASP.NET Core SignalR**
- **WebSockets transport**
- **SignalR client in Next.js**

SignalR allows the backend to push updates directly to connected clients.

---

# SignalR Hub

SignalR connections are managed through a hub.

Endpoint:

```
/hubs/market
```

Responsibilities:

- broadcast stock price updates
- broadcast portfolio value updates
- notify clients of watchlist updates

Example Hub:

```
MarketHub
```

---

# Events Emitted

The backend sends the following events to connected clients.

## priceUpdated

Triggered when a stock price changes.

Payload:

```
{
  "symbol": "AAPL",
  "price": 176.42,
  "timestamp": "2026-01-01T12:00:00Z"
}
```

Frontend behavior:

- update stock cards
- update portfolio value
- update watchlist display

---

## portfolioUpdated

Triggered when portfolio value changes.

Payload:

```
{
  "portfolioId": "uuid",
  "newValue": 15420.50
}
```

Frontend behavior:

- update portfolio summary
- update dashboard analytics

---

# Price Update Flow

Stock price updates follow this flow:

Market Data Source
→ Market Worker fetches latest prices
→ Backend updates database/cache
→ SignalR broadcasts update
→ Frontend receives event
→ UI updates instantly

---

# Connection Flow

1. Frontend loads dashboard
2. Client establishes SignalR connection
3. Client subscribes to events
4. Server pushes updates when data changes

Example frontend connection:

```
/hubs/market
```

---

# Subscription Strategy

Clients subscribe only to relevant data.

Examples:

- stocks in portfolio
- stocks in watchlist

This reduces unnecessary network traffic.

---

# Performance Considerations

To maintain performance:

- avoid sending large payloads
- broadcast only changed data
- batch updates when possible
- use Redis cache for latest prices

---

# Scaling Strategy

SignalR supports horizontal scaling using:

- Redis backplane
- Azure SignalR Service

For Stoxly, Redis may be used to synchronize updates across instances.

---

# Failure Handling

If the connection drops:

- client attempts automatic reconnect
- frontend falls back to fetching latest data via API

---

# Future Improvements

Possible enhancements:

- live trade execution updates
- websocket compression
- event throttling for high-frequency updates
