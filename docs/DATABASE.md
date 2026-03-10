# Stoxly Database Design

## Overview

Stoxly uses **PostgreSQL** as the primary relational database.

The database stores:

- users
- stocks
- portfolios
- holdings
- transactions
- watchlists
- historical price data

The schema is designed to support portfolio tracking, simulated trading, and real-time portfolio valuation.

---

# Core Entities

The system is built around the following main entities:

User
Stock
Portfolio
Holding
Transaction
Watchlist
Price History

---

# Tables

## users

Stores user account information.

Fields:

id (uuid, primary key)
email (varchar, unique)
username (varchar)
password_hash (varchar)
created_at (timestamp)

Notes:

- authentication handled at API level
- email must be unique

---

## stocks

Stores stock metadata.

Fields:

id (uuid, primary key)
symbol (varchar, unique)
company_name (varchar)
exchange (varchar)
sector (varchar)
created_at (timestamp)

Example:

AAPL
MSFT
GOOGL

---

## portfolios

Each user owns one or more portfolios.

Fields:

id (uuid, primary key)
user_id (uuid, foreign key)
name (varchar)
created_at (timestamp)

Relationships:

User → Portfolio (one-to-many)

---

## holdings

Represents the stocks currently owned in a portfolio.

Fields:

id (uuid, primary key)
portfolio_id (uuid, foreign key)
stock_id (uuid, foreign key)
quantity (decimal)
average_price (decimal)

Relationships:

Portfolio → Holdings
Stock → Holdings

---

## transactions

Records every buy or sell trade.

Fields:

id (uuid, primary key)
portfolio_id (uuid, foreign key)
stock_id (uuid, foreign key)
type (enum: BUY, SELL)
quantity (decimal)
price (decimal)
executed_at (timestamp)

Purpose:

Transactions are used to reconstruct portfolio history.

---

## watchlists

Allows users to track stocks without owning them.

Fields:

id (uuid, primary key)
user_id (uuid, foreign key)
stock_id (uuid, foreign key)
created_at (timestamp)

Relationships:

User → Watchlist
Stock → Watchlist

---

## price_history

Stores historical stock price data.

Fields:

id (uuid, primary key)
stock_id (uuid, foreign key)
price (decimal)
timestamp (timestamp)

This table supports:

- price charts
- historical analysis
- portfolio valuation history

---

# Relationships

User
→ Portfolios

Portfolio
→ Holdings
→ Transactions

Stock
→ Holdings
→ Transactions
→ Price History

User
→ Watchlist

---

# Indexing Strategy

Indexes should be created for frequently queried columns.

Recommended indexes:

stocks.symbol

holdings.portfolio_id

transactions.portfolio_id

price_history.stock_id

price_history.timestamp

These indexes improve query performance for portfolio calculations and chart data.

---

# Portfolio Value Calculation

Portfolio value is calculated as:

SUM(holding.quantity × latest_stock_price)

Where:

latest_stock_price is retrieved from the latest price entry.

This calculation may be cached in Redis for performance.

---

# Data Integrity Rules

The system must enforce:

- foreign key constraints
- non-negative quantities
- valid transaction types
- unique stock symbols

---

# Migration Strategy

Database schema changes should be handled through **EF Core migrations**.

Migration rules:

- never modify production schema manually
- always create migration scripts
- review migrations before applying

---

# Future Extensions

The schema is designed to support future features:

- dividend tracking
- portfolio performance analytics
- multiple exchanges
- advanced chart data
