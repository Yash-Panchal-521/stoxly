"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import StatCard from "@/components/cards/StatCard";
import PortfolioCard from "@/components/cards/PortfolioCard";
import CreatePortfolioModal from "@/features/portfolios/CreatePortfolioModal";
import { Button } from "@/components/ui/button";
import { usePortfolios } from "@/hooks/use-portfolios";

export default function DashboardPage() {
  const { data: portfolios, isLoading, error } = usePortfolios();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1">Dashboard</h1>
        <p className="mt-1 text-body text-text-secondary">
          Your portfolio overview at a glance.
        </p>
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Portfolio Value" value="—" />
        <StatCard title="Total Gain/Loss" value="—" />
        <StatCard title="Today's Change" value="—" />
        <StatCard title="Holdings" value="0" />
      </div>
      {/* Portfolios */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h2">My Portfolios</h2>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Portfolio
          </Button>
        </div>
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="stoxly-card h-40 animate-pulse bg-surface"
              />
            ))}
          </div>
        )}
        {error && (
          <div className="stoxly-card text-body text-danger">
            Failed to load portfolios. Please try again.
          </div>
        )}
        {portfolios && portfolios.length === 0 && (
          <div className="stoxly-card text-center">
            <p className="text-body text-text-secondary">
              You don&apos;t have any portfolios yet.
            </p>
          </div>
        )}
        {portfolios && portfolios.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolios.map((portfolio) => (
              <PortfolioCard key={portfolio.id} portfolio={portfolio} />
            ))}
          </div>
        )}

        <CreatePortfolioModal open={createOpen} onOpenChange={setCreateOpen} />
      </div>
      {/* Content grid */}{" "}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Market overview */}
        <div className="stoxly-card lg:col-span-2">
          <h2 className="text-h3 mb-4">Market Overview</h2>
          <div className="flex h-48 items-center justify-center rounded-xl bg-surface text-text-secondary text-small">
            Market data coming soon
          </div>
        </div>

        {/* Watchlist */}
        <div className="stoxly-card">
          <h2 className="text-h3 mb-4">Watchlist</h2>
          <div className="flex h-48 items-center justify-center text-text-secondary text-small">
            No stocks watchlisted
          </div>
        </div>
      </div>
      {/* Recent transactions */}
      <div className="stoxly-card">
        <h2 className="text-h3 mb-4">Recent Transactions</h2>
        <div className="flex h-24 items-center justify-center text-text-secondary text-small">
          No transactions yet
        </div>
      </div>
    </div>
  );
}
