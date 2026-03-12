# Stoxly Design System

The Stoxly design system defines the visual language for the entire application. All UI must follow these rules — no hardcoded colors, no inline styles.

---

## Design Philosophy

- **Minimal** — remove everything that is not essential
- **Modern** — flat surfaces, subtle borders, clean type
- **Professional** — fintech-grade polish
- **Data-focused** — UI stays out of the way of content

Inspired by: Linear, Stripe Dashboard, Vercel, TradingView.

---

## Color System

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens in `tailwind.config.ts`. The system supports a **dark mode (default)** and a **light mode** controlled by the `html.light` class.

### Dark Mode Palette (default)

#### Backgrounds

| Token           | Variable       | Hex       | Usage                    |
| --------------- | -------------- | --------- | ------------------------ |
| `bg-background` | `--background` | `#000000` | Page background          |
| `bg-surface`    | `--surface`    | `#1C1C1E` | Sidebar, elevated panels |
| `bg-card`       | `--card`       | `#2C2C2E` | Cards, dialogs           |

#### Brand / Accent

| Token              | Variable          | Hex       |
| ------------------ | ----------------- | --------- |
| `bg-primary`       | `--primary`       | `#0A84FF` |
| `bg-primary-hover` | `--primary-hover` | `#0070E0` |

#### Semantic

| Token                         | Variable    | Hex       | Usage                 |
| ----------------------------- | ----------- | --------- | --------------------- |
| `text-success` / `bg-success` | `--success` | `#30D158` | Positive trends, buy  |
| `text-danger` / `bg-danger`   | `--danger`  | `#FF453A` | Negative trends, sell |
| `text-warning` / `bg-warning` | `--warning` | `#FFD60A` | Warnings, cautions    |

#### Text

| Token                 | Variable           | Hex       |
| --------------------- | ------------------ | --------- |
| `text-text-primary`   | `--text-primary`   | `#F5F5F7` |
| `text-text-secondary` | `--text-secondary` | `#8E8E93` |
| `text-muted`          | `--muted`          | `#636366` |

#### Border

| Token                 | Variable         | Hex       |
| --------------------- | ---------------- | --------- |
| `border-border`       | `--border`       | `#38383A` |
| `border-border-hover` | `--border-hover` | `#48484A` |

---

### Light Mode Palette

Activated when `html` has class `light` (managed by `next-themes`).

#### Backgrounds

| Token           | Variable       | Hex       | Usage                    |
| --------------- | -------------- | --------- | ------------------------ |
| `bg-background` | `--background` | `#FFFFFF` | Page background          |
| `bg-surface`    | `--surface`    | `#F2F2F7` | Sidebar, elevated panels |
| `bg-card`       | `--card`       | `#FFFFFF` | Cards, dialogs           |

#### Text

| Token                 | Variable           | Hex       |
| --------------------- | ------------------ | --------- |
| `text-text-primary`   | `--text-primary`   | `#000000` |
| `text-text-secondary` | `--text-secondary` | `#636366` |
| `text-muted`          | `--muted`          | `#8E8E93` |

#### Border

| Token           | Variable   | Hex       |
| --------------- | ---------- | --------- |
| `border-border` | `--border` | `#D1D1D6` |

---

### Theme System

Theme mode is powered by **`next-themes`**.

```tsx
// apps/web/src/components/providers.tsx
<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
```

- The `attribute="class"` setting adds/removes the `light` class on `<html>` to switch between `:root` (dark) and `html.light {}` CSS variable blocks.
- `defaultTheme="dark"` — the app always starts in dark mode; users can toggle.
- `suppressHydrationWarning` is set on `<html>` in `layout.tsx` to prevent hydration mismatches.
- The `ThemeToggle` button lives in `TopNav` (Sun icon = switch to light, Moon icon = switch to dark). It uses a `mounted` guard to avoid rendering on the server.

---

## Typography

**Primary font:** Inter (loaded via `next/font/google`).

| Scale     | Class        | Size | Weight         |
| --------- | ------------ | ---- | -------------- |
| Heading 1 | `text-h1`    | 32px | Bold (700)     |
| Heading 2 | `text-h2`    | 24px | Semibold (600) |
| Heading 3 | `text-h3`    | 20px | Semibold (600) |
| Body      | `text-body`  | 14px | Regular (400)  |
| Small     | `text-small` | 12px | Regular (400)  |

Usage:

```html
<h1 class="text-h1">Dashboard</h1>
<p class="text-body text-text-secondary">Description text</p>
<span class="text-small text-muted">Meta info</span>
```

---

## Spacing

Follow Tailwind's default spacing scale. Key patterns:

| Context                 | Value       |
| ----------------------- | ----------- |
| Card padding            | `p-5`       |
| Section gap             | `space-y-6` |
| Grid gap                | `gap-4`     |
| Page horizontal padding | `px-6`      |
| Page vertical padding   | `py-6`      |

---

## Layout Structure

The app uses a **dashboard shell** layout:

```
┌──────────┬──────────────────────────────────┐
│          │  TopNav (sticky, h-14)           │
│  Sidebar │─────────────────────────────────│
│  220px   │                                  │
│  fixed   │  Main content                    │
│          │  max-w-content (1440px)          │
│          │  px-6 py-6                       │
└──────────┴──────────────────────────────────┘
```

- **Sidebar:** `w-sidebar` (220px), fixed left, full height.
- **Top nav:** sticky, blur backdrop, uses `var(--nav-bg)` CSS variable (responds to theme).
- **Content:** `pl-sidebar`, inner container `max-w-content` centered.

Layout file: `app/(dashboard)/layout.tsx`

---

## Component Styling Rules

All components must follow:

| Rule          | Value                                     |
| ------------- | ----------------------------------------- |
| Border radius | `rounded-xl` (0.75rem)                    |
| Borders       | `border border-border`                    |
| Shadow        | `shadow-sm`                               |
| Transitions   | `transition-all duration-150 ease-in-out` |
| Hover         | subtle elevation + color shift            |

---

## Utility Classes

Defined in `globals.css` under `@layer components`:

### Cards

```html
<!-- Default card -->
<div class="stoxly-card">…</div>

<!-- Glass card (auth pages) -->
<div class="glass-card">…</div>
```

### Buttons

```html
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-danger">Danger</button>
<button class="btn-ghost">Ghost</button>
```

### Inputs

```html
<input class="stoxly-input" placeholder="Enter value…" />
```

### Trend Indicators

```html
<span class="trend-up">↑ +2.4%</span>
<span class="trend-down">↓ -1.1%</span>
<span class="trend-neutral">– 0.0%</span>
```

### Surface Hover

```html
<!-- Interactive surfaces (nav links, icon buttons) -->
<button class="surface-hover">…</button>
```

`.surface-hover` provides a subtle background tint on hover that adapts to both dark and light themes (defined in `globals.css`).

---

## Cards

### StatCard

```tsx
<StatCard
  title="Portfolio Value"
  value="$48,352.18"
  change="2.4% today"
  trend="up"
/>
```

Props: `title`, `value`, `change?`, `trend?: "up" | "down" | "neutral"`, `children?` (optional chart slot).

---

## Forms (Auth)

Auth pages use a centered `glass-card` with a gradient background:

```tsx
<main class="relative flex min-h-screen items-center justify-center bg-background">
  <div class="glass-card w-full max-w-md">
    <!-- Brand logo, form fields, buttons -->
  </div>
</main>
```

---

## Dashboard Layout

Stat cards grid:

```html
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <!-- StatCard components -->
</div>
```

Content grid:

```html
<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
  <div class="stoxly-card lg:col-span-2">Chart</div>
  <div class="stoxly-card">Watchlist</div>
</div>
```

---

## Rules for Contributors

1. **Never hardcode colors.** Use Tailwind theme tokens (`bg-card`, `text-text-primary`, etc.).
2. **Never use inline styles.** All styling goes through Tailwind classes or component utilities.
3. **Use the utility classes** (`stoxly-card`, `btn-primary`, `stoxly-input`, etc.).
4. **Follow the typography scale.** Use `text-h1` through `text-small`.
5. **Apply standard transitions** to all interactive elements.
6. **Use `rounded-xl`** for all containers.
7. **Use `shadcn/ui`** as the base component library.

---

## Style Guide Page

A live visual reference is available at `/dev/ui` during development. It displays all colors, typography, buttons, inputs, cards, tables, and trend indicators.
