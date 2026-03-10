# User Flows – Stoxly

## Overview

This document describes the primary user journeys in Stoxly.
Each flow represents a common action a user performs while interacting with the platform.

Understanding these flows helps guide frontend design, backend API implementation, and system architecture.

---

# User Registration Flow

Goal: Allow a new user to create an account.

Steps:

1. User opens the Stoxly application.
2. User clicks **Sign Up**.
3. User enters:
   - email
   - username
   - password

4. Frontend sends request to `/api/auth/register`.
5. Backend creates the user account.
6. User receives confirmation and is redirected to login.

Result:

User account is successfully created.

---

# User Login Flow

Goal: Allow a user to access their account.

Steps:

1. User opens login page.
2. User enters email and password.
3. Frontend sends request to `/api/auth/login`.
4. Backend validates credentials.
5. Backend returns a JWT token.
6. Frontend stores token securely.
7. User is redirected to the dashboard.

Result:

User is authenticated and can access protected features.

---

# Create Portfolio Flow

Goal: Allow a user to create a new investment portfolio.

Steps:

1. User opens dashboard.
2. User clicks **Create Portfolio**.
3. User enters portfolio name.
4. Frontend sends request to `/api/portfolios`.
5. Backend creates a new portfolio record.
6. Frontend refreshes portfolio list.

Result:

New portfolio appears in the dashboard.

---

# Stock Search Flow

Goal: Allow users to find stocks.

Steps:

1. User enters a stock symbol or company name in search.
2. Frontend sends request to `/api/stocks/search`.
3. Backend queries stock database or external API.
4. Results are returned to the frontend.
5. User sees a list of matching stocks.

Result:

User can select a stock to view details.

---

# Buy Stock Flow

Goal: Allow a user to simulate purchasing stock.

Steps:

1. User selects a stock.
2. User clicks **Buy**.
3. User enters:
   - quantity
   - price

4. Frontend sends request to `/api/trades/buy`.
5. Backend validates trade.
6. Backend updates holdings.
7. Backend records transaction.
8. Portfolio value is recalculated.
9. SignalR broadcasts portfolio update.

Result:

User holdings update instantly.

---

# Sell Stock Flow

Goal: Allow a user to simulate selling stock.

Steps:

1. User selects a stock from holdings.
2. User clicks **Sell**.
3. User enters quantity and price.
4. Frontend sends request to `/api/trades/sell`.
5. Backend updates holdings.
6. Backend records transaction.
7. Portfolio value is recalculated.
8. SignalR broadcasts update.

Result:

Holdings and portfolio value update.

---

# Watchlist Flow

Goal: Allow users to track stocks without buying them.

Steps:

1. User searches for a stock.
2. User clicks **Add to Watchlist**.
3. Frontend sends request to `/api/watchlist`.
4. Backend saves watchlist entry.
5. Stock appears in watchlist view.
6. Price updates are received via SignalR.

Result:

User can monitor stock movements easily.

---

# Real-Time Update Flow

Goal: Update UI instantly when stock prices change.

Steps:

1. Frontend establishes SignalR connection.
2. Backend receives stock price updates.
3. Backend updates cache/database.
4. SignalR broadcasts `priceUpdated`.
5. Frontend receives event.
6. UI updates instantly.

Result:

Users see live price changes.

---

# Portfolio Value Update Flow

Goal: Keep portfolio value accurate in real-time.

Steps:

1. Stock price changes.
2. Backend recalculates portfolio value.
3. SignalR broadcasts `portfolioUpdated`.
4. Frontend updates dashboard.

Result:

Portfolio value reflects latest market prices.
