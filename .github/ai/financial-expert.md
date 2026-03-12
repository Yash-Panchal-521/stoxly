# Financial Domain Authority — Stoxly

## Purpose

This document defines the **complete financial domain rules** for the Stoxly platform.

It serves as the authoritative reference for:

- AI agents
- Copilot prompts
- backend API design
- financial calculation logic
- portfolio analytics

All financial logic implemented in Stoxly **must comply with the rules defined here**.

If generated code conflicts with this document, **this document takes priority**.

---

# Financial Data Architecture

Stoxly follows this financial data hierarchy:

User
└ Portfolio
└ Transactions (source of truth)
└ Holdings (derived)
└ Portfolio Metrics
└ Analytics

Core principles:

1. Transactions are immutable financial records.
2. Holdings must always be derived from transactions.
3. Portfolio metrics must be derived from holdings.
4. Market value must be derived from live market prices.

---

# Core Financial Entities

## Portfolio

A portfolio is a collection of investments owned by a user.

Examples:

Long-Term Portfolio
Trading Portfolio
Dividend Portfolio
Crypto Portfolio

A portfolio **does not store holdings directly**.

Holdings are derived from transactions.

---

## Asset / Security

A tradable financial instrument.

Examples:

AAPL — Apple
TSLA — Tesla
RELIANCE.NS — Reliance

Attributes:

symbol
exchange
currency
assetType

Possible asset types:

stock
ETF
bond
crypto
derivative

---

## Transaction

A transaction represents a **trade event**.

Fields:

symbol
type (BUY / SELL)
quantity
price
tradeDate
fees
currency

Example:

BUY 10 AAPL @ $100
SELL 5 AAPL @ $120

Transactions must be **append-only** and auditable.

---

# Cost Basis

Cost basis is the **total cost of acquiring an investment**, including purchase price and fees. ([fidelity.com][1])

Formula:

costBasis = purchasePrice × quantity + fees

Cost basis is used to calculate gains and losses when assets are sold.

---

# Cost Basis Adjustments

Cost basis can change due to:

dividend reinvestment
stock splits
bonus shares
return of capital

Tracking cost basis correctly is essential for calculating profits and taxes. ([Investopedia][2])

---

# Cost Basis Methods

Different accounting methods exist for assigning purchase cost to sold shares.

## FIFO (First In First Out)

Oldest shares are sold first.

Example:

BUY 10 @ 100
BUY 5 @ 120
SELL 8

FIFO result:

2 shares @ 100
5 shares @ 120

FIFO is commonly used by brokerages.

---

## LIFO (Last In First Out)

Newest shares are sold first.

Used less commonly in stock brokerage systems.

---

## Average Cost Method

Average cost across all shares.

Formula:

averagePrice = totalCost / totalShares

Common for mutual funds.

---

# Purchase Lots

FIFO requires tracking purchase lots.

PurchaseLot:

quantity
price
tradeDate

Example:

Lot1: 10 shares @ $100
Lot2: 5 shares @ $120

SELL transactions consume lots sequentially.

---

# Holdings

Holdings represent the **current open position**.

Fields:

symbol
quantity
averagePrice
investedValue
realizedProfit
unrealizedProfit

Holdings must be derived from transactions using the selected cost basis method.

---

# Portfolio Value

Portfolio value represents total market value.

Formula:

portfolioValue = Σ(currentPrice × quantity)

---

# Market Value

Market value of a position:

marketValue = currentPrice × quantity

Market prices must come from external APIs.

---

# Profit and Loss (P&L)

Profit and loss measures investment performance.

---

## Realized Profit

Occurs when shares are sold.

Formula:

realizedProfit = proceeds − costBasisOfSharesSold

Proceeds:

(sellPrice × sharesSold) − sellFees

---

## Unrealized Profit

Represents profit on unsold shares.

Formula:

unrealizedProfit = (currentPrice − averagePrice) × quantity

This profit fluctuates with market price changes.

---

# Return Metrics

## Absolute Return

profit = currentValue − investedCapital

---

## Percentage Return (ROI)

ROI = profit / investedCapital × 100

---

## CAGR (Compound Annual Growth Rate)

CAGR = (endingValue / beginningValue)^(1 / yearsHeld) − 1

Used for long-term performance comparison.

---

# Dividends

Dividends are payments distributed by companies to shareholders.

Types:

cash dividend
stock dividend

Dividend reinvestment creates new purchase lots.

---

# Corporate Actions

Corporate actions are events initiated by companies that affect shareholders.

Examples:

stock splits
reverse splits
dividends
share buybacks
rights issues
mergers
spin-offs

These events can modify:

share count
cost basis
portfolio value

---

# Market Data

Market prices must be retrieved from external APIs.

Examples:

Finnhub
Alpha Vantage
Polygon

Prices should be cached temporarily.

---

# Validation Rules

AI agents must enforce these constraints:

SELL quantity cannot exceed holdings
quantity must be positive
price must be positive
transactions must be chronological
holdings cannot be edited directly

---

# Performance Optimization

For large portfolios:

avoid recalculating holdings repeatedly
cache holdings results
recalculate only when transactions change

Future optimization strategies:

incremental calculations
event-driven updates
Redis caching

---

# AI Agent Responsibilities

Before generating financial code, the AI agent must:

1. Review this document.
2. Validate financial formulas.
3. Ensure holdings are derived from transactions.
4. Confirm cost basis method correctness.
5. Enforce validation rules.

---

# Required Prompt Prefix

All Copilot prompts related to financial logic must begin with:

"Review financial rules defined in financial-expert.md before implementing."

---

# Summary

Correct financial data flow:

Transactions → Holdings → Portfolio Metrics → Analytics

Holdings must always be derived using a valid cost basis method.
