import StatCard from "@/components/cards/StatCard";

export default function UIStyleGuidePage() {
  return (
    <div className="min-h-screen bg-background px-8 py-12">
      <div className="mx-auto max-w-content space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-h1">Stoxly UI Style Guide</h1>
          <p className="mt-2 text-body text-text-secondary">
            Visual reference for the Stoxly design system. All components use
            theme variables — no hardcoded colors.
          </p>
        </div>

        {/* ── Color Palette ── */}
        <Section title="Color Palette">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Swatch label="Background" color="bg-background" hex="#0F1117" />
            <Swatch label="Surface" color="bg-surface" hex="#171A21" />
            <Swatch label="Card" color="bg-card" hex="#1E222D" />
            <Swatch label="Primary" color="bg-primary" hex="#4F7FFF" />
            <Swatch label="Success" color="bg-success" hex="#22C55E" />
            <Swatch label="Danger" color="bg-danger" hex="#EF4444" />
            <Swatch label="Warning" color="bg-warning" hex="#F59E0B" />
            <Swatch label="Border" color="bg-border" hex="#2A2F3A" />
            <Swatch label="Muted" color="bg-muted" hex="#6B7280" />
          </div>
        </Section>

        {/* ── Typography ── */}
        <Section title="Typography">
          <div className="space-y-4 rounded-xl border border-border bg-card p-6">
            <p className="text-h1">Heading 1 — 32px Bold</p>
            <p className="text-h2">Heading 2 — 24px Semibold</p>
            <p className="text-h3">Heading 3 — 20px Semibold</p>
            <p className="text-body text-text-primary">Body — 14px Regular</p>
            <p className="text-small text-text-secondary">
              Small — 12px Regular
            </p>
            <p className="text-body text-muted">Muted text color</p>
          </div>
        </Section>

        {/* ── Buttons ── */}
        <Section title="Buttons">
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">Primary</button>
            <button className="btn-secondary">Secondary</button>
            <button className="btn-danger">Danger</button>
            <button className="btn-ghost">Ghost</button>
            <button className="btn-primary opacity-50 cursor-not-allowed">
              Disabled
            </button>
          </div>
        </Section>

        {/* ── Inputs ── */}
        <Section title="Inputs">
          <div className="max-w-md space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="sg-default"
                className="text-small font-medium text-text-secondary"
              >
                Default input
              </label>
              <input
                id="sg-default"
                type="text"
                placeholder="Enter value…"
                className="stoxly-input"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="sg-email"
                className="text-small font-medium text-text-secondary"
              >
                Email input
              </label>
              <input
                id="sg-email"
                type="email"
                placeholder="you@example.com"
                className="stoxly-input"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="sg-password"
                className="text-small font-medium text-text-secondary"
              >
                Password input
              </label>
              <input
                id="sg-password"
                type="password"
                placeholder="••••••••"
                className="stoxly-input"
              />
            </div>
          </div>
        </Section>

        {/* ── Stat Cards ── */}
        <Section title="Stat Cards">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Portfolio Value"
              value="$48,352.18"
              change="2.4% today"
              trend="up"
            />
            <StatCard
              title="Total Gain/Loss"
              value="+$5,219.40"
              change="12.1%"
              trend="up"
            />
            <StatCard
              title="Today's Change"
              value="-$102.30"
              change="0.21%"
              trend="down"
            />
            <StatCard title="Watchlist" value="8 stocks" trend="neutral" />
          </div>
        </Section>

        {/* ── Cards ── */}
        <Section title="Cards">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="stoxly-card">
              <h3 className="text-h3 mb-2">Default Card</h3>
              <p className="text-body text-text-secondary">
                Uses{" "}
                <code className="rounded bg-surface px-1 text-small text-primary">
                  .stoxly-card
                </code>{" "}
                utility class with theme background, border, and hover effects.
              </p>
            </div>
            <div className="glass-card">
              <h3 className="text-h3 mb-2">Glass Card</h3>
              <p className="text-body text-text-secondary">
                Backdrop-blur glass variant for auth and overlay contexts.
              </p>
            </div>
          </div>
        </Section>

        {/* ── Table ── */}
        <Section title="Table">
          <div className="stoxly-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-secondary">
                  <th className="pb-3 font-medium">Symbol</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium text-right">Price</th>
                  <th className="pb-3 font-medium text-right">Change</th>
                </tr>
              </thead>
              <tbody className="text-text-primary">
                {[
                  {
                    symbol: "AAPL",
                    name: "Apple Inc.",
                    price: "$189.84",
                    change: "+1.2%",
                    trend: "up",
                  },
                  {
                    symbol: "TSLA",
                    name: "Tesla Inc.",
                    price: "$248.50",
                    change: "-0.8%",
                    trend: "down",
                  },
                  {
                    symbol: "MSFT",
                    name: "Microsoft",
                    price: "$378.91",
                    change: "+0.5%",
                    trend: "up",
                  },
                ].map((row) => (
                  <tr
                    key={row.symbol}
                    className="border-b border-border/50 transition-all duration-150 ease-in-out hover:bg-surface"
                  >
                    <td className="py-3 font-medium">{row.symbol}</td>
                    <td className="py-3 text-text-secondary">{row.name}</td>
                    <td className="py-3 text-right">{row.price}</td>
                    <td
                      className={`py-3 text-right font-medium ${row.trend === "up" ? "trend-up" : "trend-down"}`}
                    >
                      {row.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Trend Indicators ── */}
        <Section title="Trend Indicators">
          <div className="flex gap-6">
            <span className="trend-up text-sm font-medium">↑ +2.4%</span>
            <span className="trend-down text-sm font-medium">↓ -1.1%</span>
            <span className="trend-neutral text-sm font-medium">– 0.0%</span>
          </div>
        </Section>

        {/* ── Spacing / Borders ── */}
        <Section title="Borders & Radius">
          <div className="flex flex-wrap gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-border bg-card text-small text-text-secondary">
              rounded-xl
            </div>
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-border-hover bg-card text-small text-text-secondary">
              border-hover
            </div>
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-primary/30 bg-card text-small text-primary">
              primary/30
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ── Helper components ── */

function Section({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="space-y-4">
      <h2 className="text-h2">{title}</h2>
      <div className="border-t border-border pt-4">{children}</div>
    </section>
  );
}

function Swatch({
  label,
  color,
  hex,
}: Readonly<{ label: string; color: string; hex: string }>) {
  return (
    <div className="space-y-2">
      <div className={`h-16 rounded-xl border border-border ${color}`} />
      <p className="text-small font-medium text-text-primary">{label}</p>
      <p className="text-small text-muted">{hex}</p>
    </div>
  );
}
