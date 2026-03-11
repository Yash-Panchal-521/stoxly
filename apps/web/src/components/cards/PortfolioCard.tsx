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

export default function PortfolioCard({ portfolio }: PortfolioCardProps) {
  return (
    <div className="stoxly-card flex flex-col justify-between gap-4">
      <div className="space-y-2">
        <h3 className="text-h3 truncate">{portfolio.name}</h3>
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
