"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import StatCard from "@/components/cards/StatCard";
import PortfolioCard from "@/components/cards/PortfolioCard";
import CreatePortfolioModal from "@/features/portfolios/CreatePortfolioModal";
import { Button } from "@/components/ui/button";
import { usePortfolios } from "@/hooks/use-portfolios";
import { getMetrics, getHoldings } from "@/services/portfolio-service";

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function toTrend(value: number): "up" | "down" | "neutral" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "neutral";
}

export default function DashboardPage() {
  const { data: portfolios, isLoading, error } = usePortfolios();
  const [createOpen, setCreateOpen] = useState(false);

  const portfolioIds = useMemo(
    () => portfolios?.map((p) => p.id) ?? [],
    [portfolios],
  );

  const metricsResults = useQueries({
    queries: portfolioIds.map((id) => ({
      queryKey: ["portfolios", id, "metrics"],
      queryFn: () => getMetrics(id),
      staleTime: 30_000,
      refetchInterval: 30_000,
      enabled: portfolioIds.length > 0,
    })),
  });

  const holdingsResults = useQueries({
    queries: portfolioIds.map((id) => ({
      queryKey: ["portfolios", id, "holdings"],
      queryFn: () => getHoldings(id),
      staleTime: 30_000,
      enabled: portfolioIds.length > 0,
    })),
  });

  const isStatsLoading =
    isLoading ||
    metricsResults.some((r) => r.isLoading) ||
    holdingsResults.some((r) => r.isLoading);

  const portfolioValue = metricsResults.reduce(
    (sum, r) => sum + (r.data?.portfolioValue ?? 0),
    0,
  );
  const totalProfit = metricsResults.reduce(
    (sum, r) => sum + (r.data?.totalProfit ?? 0),
    0,
  );
  const unrealizedProfit = metricsResults.reduce(
    (sum, r) => sum + (r.data?.unrealizedProfit ?? 0),
    0,
  );
  const holdingsCount = new Set(
    holdingsResults.flatMap((r) => r.data?.map((h) => h.symbol) ?? []),
  ).size;

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
        <StatCard
          title="Portfolio Value"
          value={isStatsLoading ? "—" : formatCurrency(portfolioValue)}
        />
        <StatCard
          title="Total Gain/Loss"
          value={isStatsLoading ? "—" : formatCurrency(totalProfit)}
          trend={isStatsLoading ? "neutral" : toTrend(totalProfit)}
        />
        <StatCard
          title="Unrealized P&L"
          value={isStatsLoading ? "—" : formatCurrency(unrealizedProfit)}
          trend={isStatsLoading ? "neutral" : toTrend(unrealizedProfit)}
        />
        <StatCard
          title="Holdings"
          value={isStatsLoading ? "—" : String(holdingsCount)}
        />
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
            {["sk-1", "sk-2", "sk-3"].map((k) => (
              <div
                key={k}
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
        {portfolios?.length === 0 && (
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
