"use client";

import { motion } from "framer-motion";
import { BarChart2, Zap, LineChart, BrainCircuit } from "lucide-react";

const features = [
  {
    icon: BarChart2,
    title: "Portfolio Tracking",
    description:
      "Monitor all your holdings in one place. Track gains, losses, and asset allocation updated in real time.",
  },
  {
    icon: Zap,
    title: "Real-time Market Data",
    description:
      "Get live price updates and market movements powered by SignalR for a true real-time experience with no polling.",
  },
  {
    icon: LineChart,
    title: "Trade Simulation",
    description:
      "Practice buy/sell strategies without risk. Simulate trades and see projected portfolio outcomes instantly.",
  },
  {
    icon: BrainCircuit,
    title: "Advanced Analytics",
    description:
      "Deep-dive into performance metrics, allocation breakdowns, Sharpe ratio, and historical trend analysis.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="mb-3 inline-block rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Features
          </span>
          <h2 className="text-h1 text-text-primary">
            Everything you need to invest smarter
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body text-text-secondary">
            Stoxly combines powerful analytics with a clean interface so you can
            focus on what matters — growing your wealth.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="stoxly-card group flex flex-col gap-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-150 group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-h3 text-text-primary">{f.title}</h3>
                <p className="mt-2 text-body text-text-secondary">
                  {f.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
