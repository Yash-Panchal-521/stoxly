# Stoxly — Paper Trading Platform

## Sprint Planning Document (v1.0)

**Project:** Stoxly
**Goal:** Transform Stoxly into a **stock market simulation and learning platform** where users trade with virtual money using real market prices.

All trades are simulated. No real money transactions occur.

---

# Product Vision

Stoxly allows users to:

- practice trading with virtual capital
- analyze trading performance
- learn investing strategies
- simulate market scenarios

Real data sources:

- live stock prices
- historical market prices

Simulated elements:

- buying stocks
- selling stocks
- portfolio value
- profit and loss
- trading competitions

---

# Core Product Modules

## 1. Simulation Portfolio System

Users create portfolios funded with **virtual cash**.

Example:

Simulation Portfolio
Starting Cash: $100,000

Fields:

- portfolioId
- userId
- name
- type = SIMULATION
- startingCash
- cashBalance
- createdAt

Capabilities:

- create simulation portfolio
- reset portfolio
- track cash balance
- calculate portfolio value

---

## 2. Virtual Trading Engine

Users place simulated trades.

Supported order types:

- Market order
- Limit order (future sprint)

Trade flow:

1. user selects stock
2. user enters quantity
3. system fetches current price
4. trade executes instantly
5. holdings updated
6. cash balance adjusted

Validation:

- sufficient cash for buy
- sufficient shares for sell

---

## 3. Holdings & Position Tracking

System calculates holdings from transactions.

Metrics tracked:

- quantity
- average price
- realized profit
- unrealized profit
- current value

Pricing source:

Live market price service.

---

## 4. Portfolio Value Engine

Portfolio value calculation:

Portfolio Value = Cash Balance + Holdings Value

Updated:

- on every trade
- every price update (SignalR)

---

## 5. Trading History

Users can view full trade history.

Fields:

- symbol
- side (BUY / SELL)
- quantity
- price
- trade date
- realized profit
- notes

Features:

- filter by portfolio
- pagination
- edit notes

---

## 6. Trading Analytics

System calculates performance metrics.

Metrics:

- total return
- win rate
- best trade
- worst trade
- average profit
- average loss
- profit factor

These are derived entirely from simulated trades.

---

## 7. Market Data Integration

Real market data is used for simulation.

Sources:

Live prices
Historical prices

Endpoints used:

- live quote
- batch quote
- historical price
- chart data

Price updates pushed via SignalR.

---

## 8. Simulation Dashboard

Dashboard shows:

Portfolio value
Cash balance
Unrealized profit
Total return

Additional widgets:

Best trade
Worst trade
Top holding

---

## 9. Leaderboard System

Users compete using simulation portfolios.

Leaderboard metrics:

- highest return
- most profitable portfolio
- largest portfolio value

Leaderboard types:

- global leaderboard
- monthly leaderboard
- friends leaderboard (future)

---

## 10. Trading Journal

Users can add notes to trades.

Example:

Symbol: NVDA
Action: BUY
Reason: AI boom expected

Purpose:

- improve trading discipline
- review strategy

---

# Database Schema Changes

## portfolios

Add fields:

starting_cash
cash_balance
portfolio_type (SIMULATION)

---

## simulation_transactions

id
portfolio_id
symbol
side
quantity
price
executed_at
fee
notes

---

## holdings

No major change.

Holdings still derived using FIFO logic.

---

# Backend Architecture

## Services

SimulationTradeService

Handles:

- buy execution
- sell execution
- validation
- portfolio cash updates

PortfolioAnalyticsService

Calculates:

- win rate
- trade metrics
- performance stats

---

## Workers

PriceUpdateWorker

Already exists.

Now also updates simulation portfolios.

---

# API Endpoints

## Portfolio

POST /api/simulation/portfolio
Create simulation portfolio

POST /api/simulation/reset
Reset portfolio

GET /api/simulation/portfolio
Get portfolio state

---

## Trading

POST /api/simulation/buy
Execute buy trade

POST /api/simulation/sell
Execute sell trade

GET /api/simulation/trades
Trade history

---

## Analytics

GET /api/simulation/metrics
Performance metrics

GET /api/simulation/leaderboard
Leaderboard data

---

# Frontend Features

## Simulation Dashboard

Cards:

Portfolio Value
Cash Balance
Total Return
Unrealized PnL

---

## Trading Screen

Components:

Stock search
Trade form
Order confirmation
Position table

---

## Portfolio Page

Displays:

Holdings table
Allocation chart
Profit/loss metrics

---

## Leaderboard Page

Shows:

Top traders
Monthly winners
User ranking

---

# Sprint Breakdown

## Sprint 1 — Simulation Core

Goals:

- simulation portfolio creation
- virtual cash management
- buy/sell engine
- trade validation

Deliverables:

- simulation portfolios
- basic trading functionality

---

## Sprint 2 — Portfolio Engine Integration

Goals:

- integrate holdings engine
- portfolio value calculation
- SignalR price updates

Deliverables:

- real-time portfolio value
- unrealized profit calculation

---

## Sprint 3 — Trading UI

Goals:

- trading screen
- trade confirmation
- trade history page

Deliverables:

- full trading interface

---

## Sprint 4 — Analytics

Goals:

- win rate calculation
- best/worst trade
- trade performance stats

Deliverables:

- analytics dashboard

---

## Sprint 5 — Leaderboard

Goals:

- global leaderboard
- monthly leaderboard

Deliverables:

- ranking system
- competition support

---

# Future Enhancements

Possible upgrades:

- limit orders
- stop loss
- trading competitions
- strategy tagging
- AI trade analysis

---

# Success Metrics

The platform succeeds when users:

- execute many trades
- track performance regularly
- compete in leaderboards
- learn investing strategies
