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

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens in `tailwind.config.ts`.

### Backgrounds

| Token           | Variable       | Hex       | Usage                    |
| --------------- | -------------- | --------- | ------------------------ |
| `bg-background` | `--background` | `#0F1117` | Page background          |
| `bg-surface`    | `--surface`    | `#171A21` | Sidebar, elevated panels |
| `bg-card`       | `--card`       | `#1E222D` | Cards, dialogs           |

### Brand / Accent

| Token              | Variable          | Hex       |
| ------------------ | ----------------- | --------- |
| `bg-primary`       | `--primary`       | `#4F7FFF` |
| `bg-primary-hover` | `--primary-hover` | `#3A6AEE` |

### Semantic

| Token                         | Variable    | Hex       | Usage                 |
| ----------------------------- | ----------- | --------- | --------------------- |
| `text-success` / `bg-success` | `--success` | `#22C55E` | Positive trends, buy  |
| `text-danger` / `bg-danger`   | `--danger`  | `#EF4444` | Negative trends, sell |
| `text-warning` / `bg-warning` | `--warning` | `#F59E0B` | Warnings, cautions    |

### Text

| Token                 | Variable           | Hex       |
| --------------------- | ------------------ | --------- |
| `text-text-primary`   | `--text-primary`   | `#E6E8EE` |
| `text-text-secondary` | `--text-secondary` | `#9CA3AF` |
| `text-muted`          | `--muted`          | `#6B7280` |

### Border

| Token                 | Variable         | Hex       |
| --------------------- | ---------------- | --------- |
| `border-border`       | `--border`       | `#2A2F3A` |
| `border-border-hover` | `--border-hover` | `#3A4050` |

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
│  240px   │                                  │
│  fixed   │  Main content                    │
│          │  max-w-content (1440px)          │
│          │  px-6 py-6                       │
└──────────┴──────────────────────────────────┘
```

- **Sidebar:** `w-sidebar` (240px), fixed left, full height, `bg-surface`.
- **Top nav:** sticky, blur backdrop, `bg-surface/80`.
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
