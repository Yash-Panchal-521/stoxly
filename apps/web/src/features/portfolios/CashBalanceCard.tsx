"use client";

import type { SimulationPortfolioResponse } from "@/types/portfolio";

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

interface CashBalanceCardProps {
  readonly portfolio: SimulationPortfolioResponse;
}

export default function CashBalanceCard({ portfolio }: CashBalanceCardProps) {
  const { cashBalance, startingCash, cashUsed, cashUsedPercent } = portfolio;

  return (
    <div className="stoxly-card space-y-4">
      <span className="text-small text-text-secondary">Cash Balance</span>

      <div className="flex items-end justify-between">
        <span className="text-h2 text-text-primary">
          {formatCurrency(cashBalance)}
        </span>
        <span className="text-small text-text-secondary">
          of {formatCurrency(startingCash)}
        </span>
      </div>

      {/* Cash used progress bar */}
      <div className="space-y-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-primary transition-all duration-150 ease-in-out"
            style={{ width: `${Math.min(cashUsedPercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-small text-muted">
            {formatCurrency(cashUsed)} deployed
          </span>
          <span className="text-small text-muted">
            {cashUsedPercent.toFixed(1)}% used
          </span>
        </div>
      </div>
    </div>
  );
}
