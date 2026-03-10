# Stoxly Features

## Overview

Stoxly is a stock portfolio management platform that allows users to simulate trading, track investments, and monitor portfolio performance with real-time market data.

This document lists the major features of the platform.

---

# Core Features (MVP)

## Authentication

Authentication is handled through Firebase Authentication.

Capabilities:

- email/password login
- Firebase-managed identity
- Firebase ID token authentication for protected API calls
- optional social login (future)

---

## Portfolio Management

Users can manage investment portfolios.

Capabilities:

- create portfolio
- rename portfolio
- delete portfolio
- view portfolio summary
- manage multiple portfolios

---

## Holdings Tracking

Users can track the stocks they currently own.

Information shown:

- stock symbol
- quantity owned
- average buy price
- current market price
- total holding value
- profit or loss

---

## Trade Simulation

Users can simulate stock trading.

Supported actions:

- buy stocks
- sell stocks

Each trade creates a transaction record and updates portfolio holdings.

---

## Transaction History

Users can view a complete history of trades.

Information displayed:

- stock symbol
- transaction type (buy or sell)
- quantity
- trade price
- execution date

---

## Stock Search

Users can search for stocks using:

- stock symbol
- company name

Search results show:

- stock symbol
- company name
- latest price

---

## Watchlist

Users can track stocks without owning them.

Capabilities:

- add stocks to watchlist
- remove stocks
- view watchlist prices
- monitor price movements

---

## Real-Time Updates

Stoxly provides real-time updates using SignalR.

Live updates include:

- stock price changes
- portfolio value updates
- watchlist price updates

This eliminates the need for frequent API polling.

---

# Advanced Features (Future)

These features may be added in future versions.

---

## Portfolio Analytics

Users can analyze portfolio performance.

Examples:

- total return
- unrealized gains
- performance over time
- asset allocation

---

## Historical Price Charts

Users can view historical stock price data using interactive charts.

---

## Dividend Tracking

Users can track dividend payments for dividend-paying stocks.

---

## Portfolio Comparison

Users can compare multiple portfolios.

---

## Multi-Market Support

Future versions may support multiple stock exchanges.

---

# Non-Functional Features

Stoxly also focuses on engineering quality.

Key qualities include:

- real-time data processing
- scalable backend architecture
- fast UI performance
- secure authentication through Firebase
- maintainable codebase
