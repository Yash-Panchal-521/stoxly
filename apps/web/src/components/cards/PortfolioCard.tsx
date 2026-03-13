"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PortfolioResponse } from "@/types/portfolio";

interface PortfolioCardProps {
  readonly portfolio: PortfolioResponse;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function PortfolioTypeBadge({ type }: Readonly<{ type: string }>) {
  if (type === "SIMULATION") {
    return (
      <span className="bg-primary/10 text-primary text-small rounded-xl px-2 py-0.5 font-medium">
        Sim
      </span>
    );
  }
  return (
    <span className="bg-surface text-text-secondary text-small rounded-xl px-2 py-0.5 border border-border font-medium">
      Live
    </span>
  );
}

export default function PortfolioCard({ portfolio }: PortfolioCardProps) {
  return (
    <div className="stoxly-card flex flex-col justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-h3 truncate">{portfolio.name}</h3>
          <PortfolioTypeBadge type={portfolio.portfolioType} />
        </div>
        {portfolio.description && (
          <p className="text-body text-text-secondary line-clamp-2">
            {portfolio.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-small text-muted">
            {portfolio.baseCurrency}
          </span>
          <span className="text-small text-text-secondary">
            Created {formatDate(portfolio.createdAt)}
          </span>
        </div>

        <Button variant="secondary" size="sm" asChild>
          <Link href={`/portfolio/${portfolio.id}`}>Open</Link>
        </Button>
      </div>
    </div>
  );
}
