"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import StatCard from "@/components/cards/StatCard";
import PortfolioCard from "@/components/cards/PortfolioCard";
import CreatePortfolioModal from "@/features/portfolios/CreatePortfolioModal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePortfolios } from "@/hooks/use-portfolios";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useAllTransactions } from "@/hooks/use-transactions";
import { getMetrics, getHoldings } from "@/services/portfolio-service";

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function toTrend(value: number): "up" | "down" | "neutral" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "neutral";
}

function WatchlistChangeLabel({
  isUp,
  changePercent,
}: Readonly<{
  isUp: boolean;
  changePercent: number | null;
}>) {
  if (changePercent == null) {
    return <p className="text-small text-text-secondary">—</p>;
  }
  const sign = isUp ? "+" : "";
  return (
    <p className={`text-small ${isUp ? "text-success" : "text-danger"}`}>
      {`${sign}${changePercent.toFixed(2)}%`}
    </p>
  );
}

export default function DashboardPage() {
  const { data: portfolios, isLoading, error } = usePortfolios();
  const { data: watchlist, isLoading: isWatchlistLoading } = useWatchlist();
  const { data: allTransactions, isLoading: isTransactionsLoading } =
    useAllTransactions();
  const [createOpen, setCreateOpen] = useState(false);

  const recentTransactions = useMemo(
    () => (allTransactions ?? []).slice(0, 5),
    [allTransactions],
  );

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
          {isWatchlistLoading && (
            <div className="space-y-2">
              {["wsk-1", "wsk-2", "wsk-3"].map((k) => (
                <div
                  key={k}
                  className="h-10 animate-pulse rounded-lg bg-surface"
                />
              ))}
            </div>
          )}
          {!isWatchlistLoading && (!watchlist || watchlist.length === 0) && (
            <div className="flex h-48 items-center justify-center text-text-secondary text-small">
              No stocks watchlisted
            </div>
          )}
          {!isWatchlistLoading && watchlist && watchlist.length > 0 && (
            <div className="space-y-1">
              {watchlist.map((item) => {
                const isUp = (item.changePercent ?? 0) >= 0;
                return (
                  <div
                    key={item.symbol}
                    className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-surface transition-all duration-150 ease-in-out"
                  >
                    <div>
                      <span className="text-body font-medium text-text-primary">
                        {item.symbol}
                      </span>
                      {item.companyName && (
                        <p className="text-small text-text-secondary truncate max-w-[120px]">
                          {item.companyName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-body text-text-primary">
                        {item.currentPrice == null
                          ? "—"
                          : `$${item.currentPrice.toFixed(2)}`}
                      </p>
                      <WatchlistChangeLabel
                        isUp={isUp}
                        changePercent={item.changePercent}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Recent transactions */}
      <div className="stoxly-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h3">Recent Transactions</h2>
          {recentTransactions.length > 0 && (
            <Link
              href="/trades"
              className="text-small text-primary hover:text-primary-hover transition-all duration-150 ease-in-out"
            >
              View all
            </Link>
          )}
        </div>
        {isTransactionsLoading && (
          <div className="space-y-2">
            {["tsk-1", "tsk-2", "tsk-3"].map((k) => (
              <div
                key={k}
                className="h-10 animate-pulse rounded-lg bg-surface"
              />
            ))}
          </div>
        )}
        {!isTransactionsLoading && recentTransactions.length === 0 && (
          <div className="flex h-24 items-center justify-center text-text-secondary text-small">
            No transactions yet
          </div>
        )}
        {!isTransactionsLoading && recentTransactions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="pb-2 text-left font-medium">Date</th>
                  <th className="pb-2 text-left font-medium">Symbol</th>
                  <th className="pb-2 text-left font-medium">Portfolio</th>
                  <th className="pb-2 text-left font-medium">Type</th>
                  <th className="pb-2 text-right font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-border last:border-0 hover:bg-surface transition-all duration-150 ease-in-out"
                  >
                    <td className="py-2.5 text-text-secondary">
                      {new Date(tx.tradeDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2.5 font-medium text-text-primary">
                      {tx.symbol}
                    </td>
                    <td className="py-2.5 text-text-secondary">
                      {tx.portfolioName ?? "—"}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-small font-medium ${
                          tx.type === "BUY"
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-text-primary">
                      {tx.quantity}
                    </td>
                    <td className="py-2.5 text-right text-text-primary">
                      ${tx.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
