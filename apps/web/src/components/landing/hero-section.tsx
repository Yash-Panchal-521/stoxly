"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, TrendingUp } from "lucide-react";

function MockPortfolioChart() {
  return (
    <svg viewBox="0 0 400 140" fill="none" className="w-full">
      <defs>
        <linearGradient id="heroChartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(79,127,255)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(79,127,255)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Subtle grid */}
      {[35, 70, 105].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="400"
          y2={y}
          stroke="rgb(42,47,58)"
          strokeWidth="1"
        />
      ))}
      {/* Area */}
      <path
        d="M 0,120 C 33,110 33,100 66,90 S 100,80 133,75 S 166,65 200,55 S 233,45 266,38 S 300,25 333,18 S 366,10 400,6 L 400,140 L 0,140 Z"
        fill="url(#heroChartGrad)"
      />
      {/* Line */}
      <path
        d="M 0,120 C 33,110 33,100 66,90 S 100,80 133,75 S 166,65 200,55 S 233,45 266,38 S 300,25 333,18 S 366,10 400,6"
        stroke="rgb(79,127,255)"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Endpoint dot */}
      <circle cx="400" cy="6" r="4" fill="rgb(79,127,255)" />
      <circle cx="400" cy="6" r="8" fill="rgb(79,127,255)" fillOpacity="0.2" />
    </svg>
  );
}

const mockHoldings = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: "$192.35",
    change: "+2.4%",
    up: true,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: "$415.50",
    change: "+3.2%",
    up: true,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: "$248.90",
    change: "-0.8%",
    up: false,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: "$178.20",
    change: "+1.1%",
    up: true,
  },
];

function MockDashboard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-danger/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
        <div className="ml-4 h-6 flex-1 rounded-lg bg-surface" />
      </div>

      {/* Portfolio header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div>
          <p className="text-xs text-text-secondary">Total Portfolio Value</p>
          <p className="mt-0.5 text-2xl font-bold text-text-primary">
            $84,291.40
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-success">
            <TrendingUp className="h-3 w-3" />
            <span>+12.4% this month</span>
          </div>
        </div>
        <div className="flex gap-1">
          {["1W", "1M", "1Y"].map((p) => (
            <button
              key={p}
              className={`rounded-lg px-2.5 py-1 text-xs ${
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

      {/* Chart */}
      <div className="px-4 pb-3">
        <MockPortfolioChart />
      </div>

      {/* Holdings */}
      <div className="border-t border-border px-5 pb-5 pt-3">
        <p className="mb-2 text-xs font-medium text-text-secondary">Holdings</p>
        <div className="space-y-1.5">
          {mockHoldings.map((h) => (
            <div
              key={h.symbol}
              className="flex items-center justify-between rounded-lg bg-surface px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {h.symbol[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    {h.symbol}
                  </p>
                  <p className="text-[10px] text-text-secondary">{h.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-text-primary">
                  {h.price}
                </p>
                <p
                  className={`text-[10px] font-medium ${h.up ? "text-success" : "text-danger"}`}
                >
                  {h.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-24 pt-32">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute right-1/6 top-2/3 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(42,47,58,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(42,47,58,0.3)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span>Real-time portfolio tracking</span>
            </motion.div>

            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-text-primary lg:text-[60px]">
              Track, Analyze{" "}
              <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
                and Grow
              </span>{" "}
              Your Stock Portfolio
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-text-secondary">
              Stoxly helps investors track portfolios, analyze performance,
              simulate trades, and monitor real-time market data — all in one
              clean dashboard.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
              <button className="btn-secondary inline-flex items-center gap-2.5 px-6 py-2.5 text-sm font-medium">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface">
                  <Play className="h-2.5 w-2.5 fill-current text-text-primary" />
                </div>
                View Demo
              </button>
            </div>

            {/* Metrics */}
            <div className="flex flex-wrap gap-8 border-t border-border pt-6">
              {[
                { label: "Active Investors", value: "12,000+" },
                { label: "Portfolios Tracked", value: "48,000+" },
                { label: "Uptime", value: "99.9%" },
              ].map((m) => (
                <div key={m.label}>
                  <p className="text-2xl font-bold text-text-primary">
                    {m.value}
                  </p>
                  <p className="text-sm text-text-secondary">{m.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: mock dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="relative"
          >
            {/* Glow behind card */}
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-2xl" />
            <MockDashboard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
