"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { usePortfolios } from "@/hooks/use-portfolios";
import { getMetrics } from "@/services/portfolio-service";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CreatePortfolioModal from "@/features/portfolios/CreatePortfolioModal";
import RenamePortfolioDialog from "@/features/portfolios/RenamePortfolioDialog";
import DeletePortfolioDialog from "@/features/portfolios/DeletePortfolioDialog";
import type { PortfolioResponse } from "@/types/portfolio";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface PortfolioRowProps {
  readonly portfolio: PortfolioResponse;
  readonly portfolioValue: number | undefined;
  readonly totalProfit: number | undefined;
  readonly isLoadingMetrics: boolean;
}

function PortfolioRow({
  portfolio,
  portfolioValue,
  totalProfit,
  isLoadingMetrics,
}: PortfolioRowProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const profitPositive = (totalProfit ?? 0) >= 0;

  function renderValue() {
    if (isLoadingMetrics) {
      return (
        <span className="inline-block h-4 w-20 animate-pulse rounded bg-surface" />
      );
    }
    if (portfolioValue !== undefined) {
      return formatCurrency(portfolioValue);
    }
    return "—";
  }

  function renderProfit() {
    if (isLoadingMetrics) {
      return (
        <span className="inline-block h-4 w-16 animate-pulse rounded bg-surface" />
      );
    }
    if (totalProfit !== undefined) {
      return (
        <span className={profitPositive ? "text-success" : "text-danger"}>
          {profitPositive ? "+" : ""}
          {formatCurrency(totalProfit)}
        </span>
      );
    }
    return "—";
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-text-primary">
                {portfolio.name}
              </p>
              {portfolio.portfolioType === "SIMULATION" ? (
                <span className="bg-primary/10 text-primary text-small rounded-xl px-2 py-0.5 font-medium shrink-0">
                  Sim
                </span>
              ) : (
                <span className="bg-surface text-text-secondary text-small rounded-xl px-2 py-0.5 border border-border font-medium shrink-0">
                  Live
                </span>
              )}
            </div>
            {portfolio.description && (
              <p className="text-small text-text-secondary line-clamp-1 mt-0.5">
                {portfolio.description}
              </p>
            )}
          </div>
        </TableCell>
        <TableCell>
          <span className="rounded px-2 py-0.5 text-small font-medium border border-border text-text-secondary">
            {portfolio.baseCurrency}
          </span>
        </TableCell>
        <TableCell className="text-right font-semibold text-text-primary">
          {renderValue()}
        </TableCell>
        <TableCell className="text-right">{renderProfit()}</TableCell>
        <TableCell className="text-text-secondary text-small">
          {formatDate(portfolio.createdAt)}
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/portfolio/${portfolio.id}`}>Open</Link>
            </Button>
            <button
              onClick={() => setRenameOpen(true)}
              className="text-small text-muted hover:text-text-primary transition-all duration-150 ease-in-out"
            >
              Rename
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="text-small text-muted hover:text-danger transition-all duration-150 ease-in-out"
            >
              Delete
            </button>
          </div>
        </TableCell>
      </TableRow>

      <RenamePortfolioDialog
        portfolioId={portfolio.id}
        currentName={portfolio.name}
        currentDescription={portfolio.description}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />
      <DeletePortfolioDialog
        portfolioId={portfolio.id}
        portfolioName={portfolio.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        redirectTo="/portfolio"
      />
    </>
  );
}

interface PortfolioMobileCardProps {
  readonly portfolio: PortfolioResponse;
  readonly portfolioValue: number | undefined;
  readonly totalProfit: number | undefined;
  readonly isLoadingMetrics: boolean;
  readonly profitPositive: boolean;
}

function PortfolioMobileCard({
  portfolio,
  portfolioValue,
  totalProfit,
  isLoadingMetrics,
  profitPositive,
}: PortfolioMobileCardProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="stoxly-card space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-text-primary">
                {portfolio.name}
              </p>
              {portfolio.portfolioType === "SIMULATION" ? (
                <span className="bg-primary/10 text-primary text-small rounded-xl px-2 py-0.5 font-medium shrink-0">
                  Sim
                </span>
              ) : (
                <span className="bg-surface text-text-secondary text-small rounded-xl px-2 py-0.5 border border-border font-medium shrink-0">
                  Live
                </span>
              )}
            </div>
            {portfolio.description && (
              <p className="text-small text-text-secondary line-clamp-1 mt-0.5">
                {portfolio.description}
              </p>
            )}
          </div>
          <span className="rounded px-2 py-0.5 text-small font-medium border border-border text-text-secondary shrink-0">
            {portfolio.baseCurrency}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-small">
          <div>
            <p className="text-text-secondary">Value</p>
            <p className="font-semibold text-text-primary mt-0.5">
              {isLoadingMetrics ? (
                <span className="inline-block h-4 w-20 animate-pulse rounded bg-surface" />
              ) : portfolioValue !== undefined ? (
                formatCurrency(portfolioValue)
              ) : (
                "—"
              )}
            </p>
          </div>
          <div>
            <p className="text-text-secondary">Total P&amp;L</p>
            <p
              className={`font-semibold mt-0.5 ${profitPositive ? "text-success" : "text-danger"}`}
            >
              {isLoadingMetrics ? (
                <span className="inline-block h-4 w-16 animate-pulse rounded bg-surface" />
              ) : totalProfit !== undefined ? (
                `${profitPositive ? "+" : ""}${formatCurrency(totalProfit)}`
              ) : (
                "—"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-small text-text-secondary">
            {formatDate(portfolio.createdAt)}
          </span>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/portfolio/${portfolio.id}`}>Open</Link>
            </Button>
            <button
              onClick={() => setRenameOpen(true)}
              className="text-small text-muted hover:text-text-primary transition-all duration-150 ease-in-out"
            >
              Rename
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="text-small text-muted hover:text-danger transition-all duration-150 ease-in-out"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <RenamePortfolioDialog
        portfolioId={portfolio.id}
        currentName={portfolio.name}
        currentDescription={portfolio.description}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />
      <DeletePortfolioDialog
        portfolioId={portfolio.id}
        portfolioName={portfolio.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        redirectTo="/portfolio"
      />
    </>
  );
}

export default function PortfoliosPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: portfolios, isLoading, isError } = usePortfolios();

  const metricsQueries = useQueries({
    queries: (portfolios ?? []).map((p) => ({
      queryKey: ["portfolios", p.id, "metrics"],
      queryFn: () => getMetrics(p.id),
      staleTime: 30_000,
    })),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-text-primary">My Portfolios</h1>
          <p className="text-body text-text-secondary mt-1">
            Manage all your investment portfolios.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ New Portfolio</Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="stoxly-card space-y-3">
          {["s1", "s2", "s3"].map((k) => (
            <div key={k} className="h-12 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="stoxly-card py-10 text-center">
          <p className="text-body text-danger">Failed to load portfolios.</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && portfolios?.length === 0 && (
        <div className="stoxly-card py-16 text-center">
          <p className="text-body text-text-secondary">
            You don&apos;t have any portfolios yet.
          </p>
          <p className="text-small text-muted mt-1">
            Create one to start tracking your investments.
          </p>
          <Button className="mt-6" onClick={() => setCreateOpen(true)}>
            Create Portfolio
          </Button>
        </div>
      )}

      {/* Table / List */}
      {!isLoading && !isError && portfolios && portfolios.length > 0 && (
        <>
          {/* ── Mobile list (< md) ── */}
          <div className="md:hidden space-y-3">
            {portfolios.map((portfolio, i) => {
              const portfolioValue = metricsQueries[i]?.data?.portfolioValue;
              const totalProfit = metricsQueries[i]?.data?.totalProfit;
              const isLoadingMetrics = metricsQueries[i]?.isLoading ?? true;
              const profitPositive = (totalProfit ?? 0) >= 0;

              return (
                <PortfolioMobileCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  portfolioValue={portfolioValue}
                  totalProfit={totalProfit}
                  isLoadingMetrics={isLoadingMetrics}
                  profitPositive={profitPositive}
                />
              );
            })}
          </div>

          {/* ── Desktop table (≥ md) ── */}
          <div className="hidden md:block stoxly-card p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Portfolio</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Total P&amp;L</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolios.map((portfolio, i) => (
                  <PortfolioRow
                    key={portfolio.id}
                    portfolio={portfolio}
                    portfolioValue={metricsQueries[i]?.data?.portfolioValue}
                    totalProfit={metricsQueries[i]?.data?.totalProfit}
                    isLoadingMetrics={metricsQueries[i]?.isLoading ?? true}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <CreatePortfolioModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
