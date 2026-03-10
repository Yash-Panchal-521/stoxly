# AI Development Workflows – Stoxly

This document defines standard development workflows for implementing features in the Stoxly project.

AI assistants should follow these workflows when generating new code or modifying existing features.

---

# Workflow: Add a New Backend API

Steps:

1. Update `docs/API.md` with the new endpoint specification.

2. Create request and response DTOs.

Example:

DTOs/
CreatePortfolioRequestDto
PortfolioResponseDto

3. Add service logic inside the appropriate service class.

Example:

Services/
PortfolioService.cs

4. Implement repository methods if database access is required.

Example:

Repositories/
PortfolioRepository.cs

5. Add controller endpoint.

Example:

Controllers/
PortfolioController.cs

6. Ensure error responses follow the standard error format.

---

# Workflow: Add a New Database Entity

Steps:

1. Update `docs/DATABASE.md`.

2. Create a new EF Core entity.

Example:

Models/
Portfolio.cs

3. Add relationships and navigation properties.

4. Update `DbContext`.

5. Create a migration.

Example:

```bash
dotnet ef migrations add AddPortfolioTable
```

6. Apply migration to the database.

---

# Workflow: Add a New Frontend Page

Steps:

1. Define the feature in `docs/FEATURES.md`.

2. Update user journey in `docs/USER-FLOWS.md`.

3. Create page in Next.js App Router.

Example:

```
apps/web/app/portfolio/page.tsx
```

4. Create reusable components if needed.

Example:

components/
PortfolioCard
PortfolioSummary

5. Create API service.

Example:

services/portfolioService.ts

6. Add TanStack Query hook.

Example:

hooks/usePortfolio.ts

---

# Workflow: Add a New Feature

Steps:

1. Update `ROADMAP.md`.

2. Add feature description in `docs/FEATURES.md`.

3. Add user flow in `docs/USER-FLOWS.md`.

4. Implement backend support.

5. Implement frontend UI.

6. Update relevant documentation.

---

# Workflow: Implement Realtime Update

Steps:

1. Define realtime event in `docs/REALTIME.md`.

Example:

priceUpdated
portfolioUpdated

2. Add logic in backend service.

3. Broadcast event through SignalR hub.

Example:

Hubs/
MarketHub.cs

4. Subscribe to event in frontend realtime service.

Example:

services/realtimeService.ts

5. Update UI when event is received.

---

# Workflow: Refactor Code

Steps:

1. Identify duplicated or complex logic.

2. Extract reusable services or utilities.

3. Ensure architecture layers remain correct.

Controllers → Services → Repositories

4. Improve naming clarity.

5. Update documentation if architecture changes.

---

# Workflow: Add External API Integration

Steps:

1. Create service for API communication.

Example:

Services/
MarketDataService.cs

2. Add configuration for API keys.

3. Map API response to internal models.

4. Cache results if appropriate.

5. Handle rate limits and failures gracefully.

---

# Development Principles

All workflows should follow these principles:

- keep controllers thin
- place business logic in services
- maintain strong typing
- avoid duplicated logic
- keep components small and reusable
