"use client";

import { motion } from "framer-motion";
import { UserPlus, BarChart2, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Account",
    description:
      "Sign up in seconds with email or Google. No credit card required — get full access immediately.",
  },
  {
    number: "02",
    icon: BarChart2,
    title: "Add Your Portfolio",
    description:
      "Manually add your holdings or import them. Stoxly pulls current market prices automatically.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Track Performance",
    description:
      "Monitor live updates, run analytics, simulate trades, and watch your portfolio grow — all from one dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface/20 py-24">
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
            How It Works
          </span>
          <h2 className="mt-3 text-h1 text-text-primary">
            Up and running in minutes
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body text-text-secondary">
            Getting started with Stoxly takes less than 5 minutes. No
            spreadsheets, no complexity — just your portfolio, simplified.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connector */}
          <div className="absolute left-[16.7%] right-[16.7%] top-11 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
              className="stoxly-card relative flex flex-col items-center gap-4 pt-8 text-center"
            >
              {/* Step badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
                {step.number}
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <step.icon className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-h3 text-text-primary">{step.title}</h3>
                <p className="mt-2 text-body text-text-secondary">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
