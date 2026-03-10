# AI Development Prompts – Stoxly

This file contains reusable prompts for AI assistants such as GitHub Copilot or ChatGPT.

All prompts assume the **Stoxly project architecture and tech stack**.

Tech stack:

Frontend

- Next.js (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query

Backend

- ASP.NET Core (.NET 8)
- Entity Framework Core
- PostgreSQL
- Redis
- SignalR

---

# Create Backend API Endpoint

Prompt:

Create an ASP.NET Core API endpoint that follows the Stoxly backend architecture.

Requirements:

- Controller must remain thin
- Business logic should go inside a service
- Use DTOs for request and response
- Follow REST conventions
- Include proper error handling

---

# Create Backend Service

Prompt:

Create a service class for ASP.NET Core that contains business logic for the Stoxly backend.

Requirements:

- Use dependency injection
- Keep methods focused and readable
- Avoid direct HTTP dependencies
- Use repository layer for database access

---

# Create EF Core Entity

Prompt:

Create an Entity Framework Core model for the Stoxly PostgreSQL database.

Requirements:

- Use proper data annotations
- Define relationships clearly
- Follow naming conventions defined in CODING-STANDARDS.md
- Include navigation properties where appropriate

---

# Create Repository

Prompt:

Create a repository class for the Stoxly backend.

Requirements:

- Use Entity Framework Core
- Encapsulate database access
- Avoid business logic in the repository
- Provide clean methods for data access

---

# Create Next.js Page

Prompt:

Create a Next.js page using the App Router for the Stoxly frontend.

Requirements:

- Use TypeScript
- Prefer server components
- Use shadcn/ui for UI components
- Fetch data using TanStack Query
- Follow existing folder structure

---

# Create React Component

Prompt:

Create a reusable React component for the Stoxly frontend.

Requirements:

- Use TypeScript
- Follow TailwindCSS styling
- Keep component small and reusable
- Accept clear props interface

---

# Create API Service (Frontend)

Prompt:

Create a frontend service for calling backend APIs.

Requirements:

- Use fetch or axios
- Centralize API calls
- Keep components free from direct API logic
- Return typed responses

---

# Create TanStack Query Hook

Prompt:

Create a custom hook using TanStack Query.

Requirements:

- Fetch data from the backend API
- Cache responses properly
- Handle loading and error states
- Return typed data

---

# Create SignalR Realtime Client

Prompt:

Create a SignalR client connection for the Stoxly frontend.

Requirements:

- connect to `/hubs/market`
- handle reconnection
- subscribe to priceUpdated events
- update UI state accordingly

---

# Refactor Code

Prompt:

Refactor this code according to Stoxly coding standards.

Goals:

- improve readability
- reduce duplication
- keep functions small
- follow architecture rules
