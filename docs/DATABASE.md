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

| Column         | Type          | Constraints                  |
| -------------- | ------------- | ---------------------------- |
| id             | uuid          | PK, auto-generate            |
| user_id        | varchar(128)  | FK → users.firebase_uid      |
| name           | varchar(120)  | not null                     |
| description    | text          | nullable                     |
| base_currency  | varchar(10)   | not null, default `USD`      |
| is_default     | boolean       | not null, default `false`    |
| portfolio_type | varchar(20)   | not null, default `TRACKING` |
| starting_cash  | decimal(18,4) | nullable                     |
| cash_balance   | decimal(18,4) | nullable                     |
| created_at     | timestamptz   | not null                     |
| updated_at     | timestamptz   | nullable                     |
| deleted_at     | timestamptz   | nullable (soft delete)       |

Constraints:

- Partial unique index on `(user_id, is_default)` where `is_default = true AND deleted_at IS NULL` — enforces exactly one default portfolio per user.
- Cascade delete: deleting a user removes their portfolios.
- EF Core global query filter: `deleted_at IS NULL` applied automatically.

Notes:

- `portfolio_type` is `TRACKING` for standard portfolios and `SIMULATION` for virtual trading portfolios.
- `starting_cash` and `cash_balance` are only populated for `SIMULATION` portfolios — they are `NULL` for `TRACKING` portfolios.
- On portfolio reset, `cash_balance` is restored to `starting_cash` and all transactions are soft-deleted.

Indexes: `user_id`, `(user_id, is_default)` (partial unique)

Migration: `20260313120000_AddSimulationFieldsToPortfolio`

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

## watchlists

Allows users to track stocks without owning them.

| Column     | Type         | Constraints             |
| ---------- | ------------ | ----------------------- |
| id         | uuid         | PK, auto-generate       |
| user_id    | varchar(128) | FK → users.firebase_uid |
| ticker     | varchar(20)  | FK → symbols.ticker     |
| created_at | timestamptz  | not null                |

Notes:

- Each `(user_id, ticker)` pair is unique — duplicate watchlist entries are rejected with `409 Conflict`.
- `PriceUpdateWorker` merges watchlist tickers with transaction symbols when fetching price updates.
- Entries are not soft-deleted; `DELETE /api/watchlist/{symbol}` performs a hard delete.

Indexes: `user_id`, `(user_id, ticker)` (unique)

Migration: `20260313044941_AddWatchlistsTable`

---

# Planned Tables

The following tables are designed but not yet implemented.

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
  │    └─ Transaction (portfolio_id → portfolios.id)
  └─ Watchlist (user_id → firebase_uid)

Symbol (ticker)
  └─ Watchlist.ticker
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
