"use client";

import { motion } from "framer-motion";

function LargePortfolioChart() {
  return (
    <svg viewBox="0 0 800 220" fill="none" className="w-full">
      <defs>
        <linearGradient id="showcaseChartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(79,127,255)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="rgb(79,127,255)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[44, 88, 132, 176].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="800"
          y2={y}
          stroke="rgb(42,47,58)"
          strokeWidth="1"
        />
      ))}
      {/* Area */}
      <path
        d="M 0,195 C 67,182 67,170 133,158 S 200,144 267,130 S 333,108 400,95 S 466,72 533,58 S 600,40 667,26 S 733,14 800,8 L 800,220 L 0,220 Z"
        fill="url(#showcaseChartGrad)"
      />
      {/* Main line */}
      <path
        d="M 0,195 C 67,182 67,170 133,158 S 200,144 267,130 S 333,108 400,95 S 466,72 533,58 S 600,40 667,26 S 733,14 800,8"
        stroke="rgb(79,127,255)"
        strokeWidth="2.5"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Endpoint indicator */}
      <circle cx="800" cy="8" r="5" fill="rgb(79,127,255)" />
      <circle
        cx="800"
        cy="8"
        r="11"
        fill="rgb(79,127,255)"
        fillOpacity="0.15"
      />
      {/* Month labels */}
      {["Jan", "Mar", "May", "Jul", "Sep", "Nov"].map((m, i) => (
        <text
          key={m}
          x={i * 133 + 30}
          y="215"
          className="fill-current"
          style={{ fill: "rgb(107,114,128)", fontSize: "11px" }}
        >
          {m}
        </text>
      ))}
    </svg>
  );
}

function getSubColor(pos: boolean | null): string {
  if (pos === true) return "text-success";
  if (pos === false) return "text-danger";
  return "text-text-secondary";
}

const holdings = [
  {
    symbol: "AAPL",
    shares: "50",
    value: "$9,617.50",
    gain: "+$1,240.00",
    pct: "+14.8%",
    up: true,
  },
  {
    symbol: "MSFT",
    shares: "25",
    value: "$10,387.50",
    gain: "+$2,187.50",
    pct: "+26.7%",
    up: true,
  },
  {
    symbol: "GOOGL",
    shares: "30",
    value: "$5,346.00",
    gain: "+$896.00",
    pct: "+20.1%",
    up: true,
  },
  {
    symbol: "TSLA",
    shares: "20",
    value: "$4,978.00",
    gain: "-$422.00",
    pct: "-7.8%",
    up: false,
  },
  {
    symbol: "AMZN",
    shares: "15",
    value: "$2,913.75",
    gain: "+$313.75",
    pct: "+12.1%",
    up: true,
  },
];

export function DashboardShowcase() {
  return (
    <section className="bg-surface/20 py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="mb-3 inline-block rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Dashboard
          </span>
          <h2 className="text-h1 text-text-primary">
            Your portfolio, at a glance
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body text-text-secondary">
            A clean, real-time dashboard giving you full visibility into every
            aspect of your investments.
          </p>
        </motion.div>

        {/* Dashboard card */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          {/* Window chrome */}
          <div className="flex items-center justify-between border-b border-border px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-danger/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-success/60" />
            </div>
            <div className="rounded-lg bg-surface px-4 py-1 text-xs text-text-secondary">
              stoxly.app/dashboard · My Portfolio
            </div>
            <div className="flex gap-1.5">
              {["1W", "1M", "3M", "1Y"].map((p) => (
                <button
                  key={p}
                  className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                    p === "1Y"
                      ? "bg-primary text-primary-foreground"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-px border-b border-border bg-border sm:grid-cols-4">
            {[
              {
                label: "Total Value",
                value: "$84,291.40",
                sub: "+12.4% all time",
                pos: true,
              },
              {
                label: "Day Change",
                value: "+$1,204.80",
                sub: "+1.45% today",
                pos: true,
              },
              {
                label: "Total Gain",
                value: "+$9,291.25",
                sub: "since inception",
                pos: true,
              },
              {
                label: "Cash Balance",
                value: "$12,450.00",
                sub: "available",
                pos: null,
              },
            ].map((s) => (
              <div key={s.label} className="bg-card px-6 py-4">
                <p className="text-xs text-text-secondary">{s.label}</p>
                <p className="mt-1 text-lg font-bold text-text-primary">
                  {s.value}
                </p>
                <p className={`text-xs ${getSubColor(s.pos)}`}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="px-6 pb-2 pt-4">
            <LargePortfolioChart />
          </div>

          {/* Holdings table */}
          <div className="border-t border-border">
            <div className="grid grid-cols-5 px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-text-secondary">
              <span>Symbol</span>
              <span className="hidden sm:block">Shares</span>
              <span>Value</span>
              <span className="hidden sm:block">Gain / Loss</span>
              <span className="text-right">Change</span>
            </div>
            {holdings.map((h, i) => (
              <motion.div
                key={h.symbol}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="grid grid-cols-5 items-center px-6 py-3 text-sm transition-colors hover:bg-surface/40"
              >
                <span className="font-semibold text-text-primary">
                  {h.symbol}
                </span>
                <span className="hidden text-text-secondary sm:block">
                  {h.shares}
                </span>
                <span className="text-text-primary">{h.value}</span>
                <span
                  className={`hidden sm:block ${h.up ? "text-success" : "text-danger"}`}
                >
                  {h.gain}
                </span>
                <span
                  className={`text-right font-semibold ${h.up ? "text-success" : "text-danger"}`}
                >
                  {h.pct}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
