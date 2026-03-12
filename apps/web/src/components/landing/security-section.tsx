"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Zap, RefreshCw } from "lucide-react";

const items = [
  {
    icon: Shield,
    title: "Firebase Authentication",
    description:
      "Industry-standard auth powered by Firebase with support for email, Google, and multi-factor authentication.",
  },
  {
    icon: Lock,
    title: "Data Encryption",
    description:
      "All data in transit and at rest is encrypted using TLS 1.3 and AES-256 — your financial data stays private.",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description:
      "Powered by SignalR for sub-second price and portfolio updates — no polling, no stale data.",
  },
  {
    icon: RefreshCw,
    title: "99.9% Uptime",
    description:
      "Deployed on Azure with auto-scaling and regional failover ensuring maximum availability.",
  },
];

export function SecuritySection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="mb-3 inline-block rounded-full border border-success/25 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            Security & Infrastructure
          </span>
          <h2 className="mt-3 text-h1 text-text-primary">
            Built for security and reliability
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body text-text-secondary">
            Your financial data deserves enterprise-grade security. Stoxly is
            built with security and reliability as first-class concerns from the
            ground up.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="stoxly-card flex flex-col gap-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-h3 text-text-primary">{item.title}</h3>
                <p className="mt-2 text-body text-text-secondary">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
