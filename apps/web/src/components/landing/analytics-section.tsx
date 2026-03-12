"use client";

import { motion } from "framer-motion";
import { PieChart, TrendingUp, BarChart } from "lucide-react";

const analyticsFeatures = [
  {
    icon: PieChart,
    title: "Allocation Analysis",
    description:
      "Visualize how your capital is distributed across sectors, asset classes, and geographies with interactive breakdowns.",
  },
  {
    icon: TrendingUp,
    title: "Performance Tracking",
    description:
      "Compare your portfolio returns against benchmarks like the S&P 500 and NASDAQ over any time period.",
  },
  {
    icon: BarChart,
    title: "Portfolio Insights",
    description:
      "Identify top performers, concentration risk, correlation, and diversification opportunities at a glance.",
  },
];

const allocation = [
  { label: "Technology", pct: 45, color: "rgb(79,127,255)" },
  { label: "Consumer", pct: 20, color: "rgb(34,197,94)" },
  { label: "Healthcare", pct: 15, color: "rgb(245,158,11)" },
  { label: "Energy", pct: 12, color: "rgb(168,85,247)" },
  { label: "Other", pct: 8, color: "rgb(107,114,128)" },
];

const metrics = [
  { label: "Sharpe Ratio", value: "1.84" },
  { label: "Beta", value: "0.92" },
  { label: "Max Drawdown", value: "-8.2%" },
  { label: "Volatility", value: "14.3%" },
];

function AllocationCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">
          Portfolio Allocation
        </p>
        <span className="text-xs text-text-secondary">Updated live</span>
      </div>
      <p className="mb-5 text-xs text-text-secondary">By sector</p>

      <div className="space-y-3.5">
        {allocation.map((s) => (
          <div key={s.label}>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-text-secondary">{s.label}</span>
              <span className="font-semibold text-text-primary">{s.pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: s.color }}
                initial={{ width: 0 }}
                whileInView={{ width: `${s.pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Risk metrics */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl bg-surface p-3">
            <p className="text-xs text-text-secondary">{m.label}</p>
            <p className="mt-0.5 text-base font-bold text-text-primary">
              {m.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsSection() {
  return (
    <section id="analytics" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <AllocationCard />
          </motion.div>

          {/* Right: copy */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex flex-col gap-8"
          >
            <div>
              <span className="mb-3 inline-block rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Analytics
              </span>
              <h2 className="mt-3 text-h1 text-text-primary">
                Deep insights into your investments
              </h2>
              <p className="mt-4 text-body text-text-secondary">
                Go beyond simple profit/loss tracking. Stoxly delivers
                institutional-grade analytics to help you make smarter,
                data-driven investment decisions.
              </p>
            </div>

            <div className="space-y-6">
              {analyticsFeatures.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-h3 text-text-primary">{f.title}</h3>
                    <p className="mt-1 text-body text-text-secondary">
                      {f.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
