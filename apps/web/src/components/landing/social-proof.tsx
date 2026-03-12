"use client";

import { motion } from "framer-motion";

const brands = [
  "Goldman Sachs",
  "Fidelity",
  "Vanguard",
  "BlackRock",
  "Schwab",
  "Robinhood",
];

export function SocialProof() {
  return (
    <section className="border-y border-border bg-surface/20 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <motion.p
          className="mb-8 text-center text-sm font-medium text-text-secondary"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Built for modern investors
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {brands.map((brand, i) => (
            <motion.span
              key={brand}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              viewport={{ once: true }}
              className="text-base font-semibold text-muted transition-colors duration-150 hover:text-text-secondary"
            >
              {brand}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
