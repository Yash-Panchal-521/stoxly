# Stoxly Database Design

## Overview

Stoxly uses **PostgreSQL** as the primary relational database, accessed via **Entity Framework Core** (`Npgsql.EntityFrameworkCore.PostgreSQL`).

All schema changes are managed through EF Core migrations located in `apps/api/src/Stoxly.Api/Migrations/`.

---

# Implemented Tables

## users

Stores user identity information linked to Firebase Authentication.

| Column       | Type         | Constraints       |
| ------------ | ------------ | ----------------- |
| id           | uuid         | PK, auto-generate |
| firebase_uid | varchar(128) | unique, not null  |
| email        | varchar(256) | unique, not null  |
| created_at   | timestamptz  | not null          |

Notes:

- `firebase_uid` is the unique identifier issued by Firebase Authentication.
- The backend never stores passwords or password hashes.
- All related data (portfolios, transactions) references `firebase_uid` as the user foreign key rather than `id`, matching the claim available on every authenticated request.

Indexes: `firebase_uid` (unique), `email` (unique)

---

## portfolios

Each user owns one or more portfolios.

| Column        | Type         | Constraints               |
| ------------- | ------------ | ------------------------- |
| id            | uuid         | PK, auto-generate         |
| user_id       | varchar(128) | FK → users.firebase_uid   |
| name          | varchar(120) | not null                  |
| description   | text         | nullable                  |
| base_currency | varchar(10)  | not null, default `USD`   |
| is_default    | boolean      | not null, default `false` |
| created_at    | timestamptz  | not null                  |
| updated_at    | timestamptz  | nullable                  |
| deleted_at    | timestamptz  | nullable (soft delete)    |

Constraints:

- Partial unique index on `(user_id, is_default)` where `is_default = true AND deleted_at IS NULL` — enforces exactly one default portfolio per user.
- Cascade delete: deleting a user removes their portfolios.
- EF Core global query filter: `deleted_at IS NULL` applied automatically.

Indexes: `user_id`, `(user_id, is_default)` (partial unique)

---

## transactions

Records every buy or sell trade against a portfolio.

| Column       | Type          | Constraints            |
| ------------ | ------------- | ---------------------- |
| id           | uuid          | PK, auto-generate      |
| portfolio_id | uuid          | FK → portfolios.id     |
| symbol       | varchar(20)   | not null               |
| type         | varchar(4)    | enum: `BUY`, `SELL`    |
| quantity     | decimal(18,8) | not null               |
| price        | decimal(18,4) | not null               |
| fee          | decimal(18,4) | not null, default `0`  |
| trade_date   | date          | not null               |
| notes        | text          | nullable               |
| created_at   | timestamptz   | not null               |
| updated_at   | timestamptz   | nullable               |
| deleted_at   | timestamptz   | nullable (soft delete) |

Notes:

- `symbol` is stored directly on the transaction (denormalised) for query simplicity. It is validated against the `symbols` table at write time.
- Holdings are never stored; they are recalculated from transactions on demand using FIFO.
- EF Core global query filter: `deleted_at IS NULL` applied automatically.

Indexes: `portfolio_id`, `symbol`, `trade_date`

---

## symbols

Stores known stock tickers, lazily populated from Finnhub search results.

| Column     | Type        | Constraints       |
| ---------- | ----------- | ----------------- |
| id         | uuid        | PK, auto-generate |
| ticker     | varchar(20) | unique, not null  |
| name       | text        | nullable          |
| exchange   | varchar(50) | nullable          |
| currency   | varchar(10) | nullable          |
| type       | varchar(20) | nullable          |
| created_at | timestamptz | not null          |

Notes:

- Populated lazily: a Finnhub search result is upserted into this table so subsequent searches resolve locally.
- `TransactionService` validates the `symbol` field against this table before accepting a new transaction.
- `ISymbolRepository.SearchSymbolsAsync` uses a case-insensitive `ILike` on both `ticker` and `name`.

Indexes: `ticker` (unique)

Migration: `20260312095422_AddSymbolsTable`

---

# Planned Tables

The following tables are designed but not yet implemented.

## watchlists

Allows users to track stocks without owning them.

| Column     | Type         | Constraints             |
| ---------- | ------------ | ----------------------- |
| id         | uuid         | PK                      |
| user_id    | varchar(128) | FK → users.firebase_uid |
| ticker     | varchar(20)  | FK → symbols.ticker     |
| created_at | timestamptz  | not null                |

Once implemented, `PriceUpdateWorker` will automatically merge watchlist symbols into its price-fetch loop.

## price_history

Stores historical OHLC price data per symbol for charting.

| Column      | Type          | Constraints         |
| ----------- | ------------- | ------------------- |
| id          | uuid          | PK                  |
| ticker      | varchar(20)   | FK → symbols.ticker |
| open        | decimal(18,4) |                     |
| high        | decimal(18,4) |                     |
| low         | decimal(18,4) |                     |
| close       | decimal(18,4) |                     |
| volume      | bigint        |                     |
| recorded_at | timestamptz   | not null            |

---

# Relationships

```
User (firebase_uid)
  └─ Portfolio (user_id → firebase_uid)
       └─ Transaction (portfolio_id → portfolios.id)

Symbol (ticker)
  └─ [Watchlist.ticker]  (planned)
  └─ [PriceHistory.ticker] (planned)
```

Holdings are **not stored** — they are computed from transactions at query time using FIFO.

---

# Indexing Strategy

All foreign key columns are indexed. Additional indexes:

| Table        | Column(s)             | Type           | Reason                          |
| ------------ | --------------------- | -------------- | ------------------------------- |
| users        | firebase_uid          | unique         | primary lookup path             |
| users        | email                 | unique         | uniqueness check on register    |
| portfolios   | user_id               | btree          | list portfolios by user         |
| portfolios   | (user_id, is_default) | partial unique | enforce single default          |
| transactions | portfolio_id          | btree          | load transactions per portfolio |
| transactions | symbol                | btree          | price worker symbol collection  |
| transactions | trade_date            | btree          | chronological ordering          |
| symbols      | ticker                | unique         | exact lookup + upsert check     |

---

# EF Core Conventions

- All entities use `Guid` primary keys with database-generated values.
- Soft delete is implemented via `deleted_at` nullable timestamp + global query filter (portfolios, transactions).
- Enum columns (`TransactionType`) are stored as strings.
- Decimal precision is explicitly configured: `quantity` at (18, 8), `price`/`fee` at (18, 4).
- Cascade deletes are configured explicitly per relationship.

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

Stores user identity information linked to Firebase Authentication.

Fields:

id (uuid, primary key)
firebase_uid (varchar, unique)
email (varchar)
created_at (timestamp)

Notes:

- `firebase_uid` is the unique identifier issued by Firebase Authentication
- the backend never stores passwords or password hashes
- the database links application data to Firebase identities through `firebase_uid`

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

User records are resolved from verified Firebase claims. The backend uses the Firebase `uid` claim to map requests to the local `users` table.

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
