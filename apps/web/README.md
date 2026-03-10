# Stoxly Web

Next.js App Router frontend for Stoxly.

## Stack

- Next.js 16
- TypeScript
- TailwindCSS 4
- shadcn/ui-style components
- TanStack Query
- Zustand
- Firebase Authentication
- SignalR client

## Environment Variables

Copy `.env.example` and provide values for:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

## Local Development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Structure

```text
app/         App Router pages, layout, providers
components/  Reusable UI and layout components
features/    Portfolio, watchlist, and trading modules
hooks/       React Query and UI state hooks
services/    API and realtime communication layer
lib/         Firebase setup and utilities
types/       Frontend domain models
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
