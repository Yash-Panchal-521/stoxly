# Stoxly — Project Progress

> Last updated: March 12, 2026

---

## Overall Status

| Area                        | Status                       |
| --------------------------- | ---------------------------- |
| Authentication              | ✅ Complete                  |
| Portfolio Management        | ✅ Complete                  |
| Transaction Recording       | ✅ Complete                  |
| Holdings Tracking           | ✅ Complete                  |
| Portfolio Metrics           | ��� Backend done, UI pending |
| Dashboard UI                | ✅ Complete                  |
| Landing Page                | ✅ Complete                  |
| Design System               | ✅ Complete                  |
| Real-Time Updates (SignalR) | ❌ Not started               |
| Live Market Prices          | ❌ Not started               |
| Watchlist                   | ❌ Not started               |
| Background Worker           | ❌ Not started               |

---

## What's Been Built

### Authentication

Users can register, log in with email/password or Google, reset their password, and log out. Sessions are protected across both the frontend and backend using Firebase.

### Portfolio Management

Users can create multiple portfolios, rename or delete them, and have one marked as their default. Basic validations are in place such as name length and a portfolio cap per user.

### Transaction Recording

Users can log buy and sell trades against a portfolio — including symbol, quantity, price, fees, date, and notes. Transactions can be edited and deleted.

### Holdings Tracking

Holdings are calculated automatically from transaction history using a FIFO cost basis method. The system tracks quantity held, average purchase price, and realized profit from closed positions.

### Portfolio Metrics

The backend calculates total portfolio value, total invested capital, realized profit, unrealized profit, and overall return. The UI currently shows placeholder values pending live market price integration.

### Dashboard

The main dashboard shows an overview of all portfolios with stat cards, a portfolio list, and a create-portfolio flow. Each portfolio has its own detail page showing holdings and transaction history.

### Landing Page

A full marketing landing page is in place covering the product hero, feature highlights, how-it-works walkthrough, analytics preview, social proof, security messaging, and a call-to-action.

### Design System

A consistent visual language is established across the app — color tokens, typography scale, reusable component styles (cards, buttons, inputs, badges), and layout patterns for both dashboard and auth pages.
