"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAllTransactions } from "@/hooks/use-transactions";
import { usePortfolios } from "@/hooks/use-portfolios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatQuantity(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
}

const ALL_PORTFOLIOS = "__all__";

export default function TradesPage() {
  const [selectedPortfolioId, setSelectedPortfolioId] =
    useState(ALL_PORTFOLIOS);

  const { data: transactions, isLoading, isError } = useAllTransactions();
  const { data: portfolios } = usePortfolios();

  const filtered = useMemo(() => {
    if (!transactions) return [];
    if (selectedPortfolioId === ALL_PORTFOLIOS) return transactions;
    return transactions.filter((t) => t.portfolioId === selectedPortfolioId);
  }, [transactions, selectedPortfolioId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 text-text-primary">Trades</h1>
          <p className="text-body text-text-secondary mt-1">
            All transactions across your portfolios.
          </p>
        </div>

        {/* Portfolio filter */}
        <div className="shrink-0 w-52">
          <Select
            value={selectedPortfolioId}
            onValueChange={setSelectedPortfolioId}
          >
            <SelectTrigger className="stoxly-input h-9 text-small">
              <SelectValue placeholder="All portfolios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_PORTFOLIOS}>All portfolios</SelectItem>
              {(portfolios ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary badge */}
      {!isLoading && !isError && (
        <p className="text-small text-text-secondary">
          Showing{" "}
          <span className="font-semibold text-text-primary">
            {filtered.length}
          </span>{" "}
          transaction{filtered.length === 1 ? "" : "s"}
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="stoxly-card space-y-3">
          {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
            <div key={k} className="h-10 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="stoxly-card py-10 text-center">
          <p className="text-body text-danger">Failed to load transactions.</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="stoxly-card py-16 text-center">
          <p className="text-body text-text-secondary">
            No transactions found.
          </p>
          <p className="text-small text-muted mt-1">
            Add trades from a portfolio to see them here.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="stoxly-card p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Portfolio</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tx) => {
                const isBuy = tx.type === "BUY";
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="text-text-secondary text-small whitespace-nowrap">
                      {formatDate(tx.tradeDate)}
                    </TableCell>
                    <TableCell>
                      {tx.portfolioName ? (
                        <Link
                          href={`/portfolio/${tx.portfolioId}`}
                          className="text-small font-medium text-text-secondary hover:text-text-primary transition-all duration-150 ease-in-out"
                        >
                          {tx.portfolioName}
                        </Link>
                      ) : (
                        <span className="text-small text-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-text-primary">
                      {tx.symbol}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-small font-semibold ${
                          isBuy ? "trend-up" : "trend-down"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-text-primary">
                      {formatQuantity(tx.quantity)}
                    </TableCell>
                    <TableCell className="text-right text-text-primary">
                      ${formatCurrency(tx.price)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-text-primary">
                      ${formatCurrency(tx.total)}
                    </TableCell>
                    <TableCell className="text-small text-text-secondary max-w-[160px] truncate">
                      {tx.notes ?? "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
