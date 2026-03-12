"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePortfolio } from "@/hooks/use-portfolio";
import { Button } from "@/components/ui/button";
import DeletePortfolioDialog from "@/features/portfolios/DeletePortfolioDialog";
import HoldingsTable from "@/features/portfolios/HoldingsTable";
import TransactionList from "@/features/transactions/TransactionList";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PortfolioDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: portfolio, isLoading, isError } = usePortfolio(params.id);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-surface" />
        <div className="stoxly-card space-y-4">
          <div className="h-6 w-64 animate-pulse rounded bg-surface" />
          <div className="h-4 w-96 animate-pulse rounded bg-surface" />
          <div className="h-4 w-32 animate-pulse rounded bg-surface" />
        </div>
      </div>
    );
  }

  if (isError || !portfolio) {
    return (
      <div className="stoxly-card flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-body text-danger">Failed to load portfolio.</p>
        <Button variant="secondary" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-small text-text-secondary hover:text-text-primary transition-all duration-150 ease-in-out"
          >
            &larr; Back to Dashboard
          </button>
          <h1 className="text-h1">{portfolio.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-surface px-3 py-1 text-small text-text-secondary border border-border">
            {portfolio.baseCurrency}
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Portfolio Info */}
      <div className="stoxly-card space-y-4">
        <h2 className="text-h3">Overview</h2>
        {portfolio.description ? (
          <p className="text-body text-text-secondary">
            {portfolio.description}
          </p>
        ) : (
          <p className="text-body text-muted italic">No description</p>
        )}
        <p className="text-small text-muted">
          Created {formatDate(portfolio.createdAt)}
        </p>
      </div>

      {/* Transactions */}
      <TransactionList portfolioId={portfolio.id} />

      {/* Holdings */}
      <HoldingsTable portfolioId={portfolio.id} />

      {/* Future placeholders */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="stoxly-card flex flex-col items-center justify-center py-10">
          <span className="text-h3 text-muted">Analytics</span>
          <span className="text-small text-muted mt-1">Coming soon</span>
        </div>
      </div>
      <DeletePortfolioDialog
        portfolioId={portfolio.id}
        portfolioName={portfolio.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
