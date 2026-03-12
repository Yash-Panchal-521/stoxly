"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

const perks = [
  "Free to start — no credit card required",
  "Real-time price updates via SignalR",
  "Unlimited portfolio holdings",
];

export function CTASection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-12 text-center lg:p-20"
        >
          {/* Centered glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/20 blur-3xl" />
          {/* Grid overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(42,47,58,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(42,47,58,0.2)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]" />

          <div className="relative">
            <span className="mb-4 inline-block rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Get Started Today
            </span>
            <h2 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-text-primary lg:text-5xl">
              Start tracking your{" "}
              <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
                investments today
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-lg text-text-secondary">
              Join thousands of investors who use Stoxly to track, analyze, and
              grow their portfolios — all in one beautifully crafted platform.
            </p>

            {/* Perks */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              {perks.map((p) => (
                <div
                  key={p}
                  className="flex items-center gap-2 text-sm text-text-secondary"
                >
                  <CheckCircle className="h-4 w-4 text-success" />
                  {p}
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="btn-secondary px-8 py-3 text-sm font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
