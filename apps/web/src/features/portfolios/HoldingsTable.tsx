"use client";

import { useEffect, useRef, useState } from "react";
import { useHoldings } from "@/hooks/use-holdings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { HoldingDto } from "@/types/portfolio";

interface HoldingsTableProps {
  portfolioId: string;
  /** Live price overrides from SignalR. Keyed by uppercase symbol. */
  priceOverrides?: Record<string, { price: number }>;
}

function formatCurrency(value: number | null, fallback = "—"): string {
  if (value === null || value === undefined) return fallback;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatQuantity(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  }).format(value);
}

function profitColorClass(value: number): string {
  if (value > 0) return "text-success";
  if (value < 0) return "text-danger";
  return "text-text-secondary";
}

function ProfitCell({ value }: Readonly<{ value: number | null }>) {
  if (value === null || value === undefined) {
    return <TableCell className="text-right text-muted">—</TableCell>;
  }
  return (
    <TableCell className={`text-right font-medium ${profitColorClass(value)}`}>
      {value > 0 ? "+" : ""}
      {formatCurrency(value)}
    </TableCell>
  );
}

function HoldingsTableSkeleton() {
  const skeletonKeys = ["sk-0", "sk-1", "sk-2"];
  return (
    <div className="space-y-2">
      {skeletonKeys.map((key) => (
        <div key={key} className="h-12 animate-pulse rounded-xl bg-surface" />
      ))}
    </div>
  );
}

function computeValue(
  holding: HoldingDto,
  overridePrice?: number,
): number | null {
  const price = overridePrice ?? holding.currentPrice;
  if (price === null || price === undefined) return null;
  return price * holding.quantity;
}

function computeUnrealizedProfit(
  holding: HoldingDto,
  overridePrice?: number,
): number | null {
  const price = overridePrice ?? holding.currentPrice;
  if (price === null || price === undefined) return null;
  return (price - holding.averagePrice) * holding.quantity;
}

export default function HoldingsTable({
  portfolioId,
  priceOverrides,
}: Readonly<HoldingsTableProps>) {
  const { data: holdings, isLoading, isError } = useHoldings(portfolioId);

  // Flash animation — track which rows just had a price tick
  const prevPricesRef = useRef<Record<string, number>>({});
  const [flashMap, setFlashMap] = useState<Record<string, "up" | "down">>({});

  useEffect(() => {
    if (!priceOverrides) return;

    const flashes: Record<string, "up" | "down"> = {};
    for (const [symbol, override] of Object.entries(priceOverrides)) {
      const prev = prevPricesRef.current[symbol];
      if (prev !== undefined && prev !== override.price) {
        flashes[symbol] = override.price > prev ? "up" : "down";
      }
      prevPricesRef.current[symbol] = override.price;
    }

    if (Object.keys(flashes).length > 0) {
      setFlashMap(flashes);
      const timer = setTimeout(() => setFlashMap({}), 700);
      return () => clearTimeout(timer);
    }
  }, [priceOverrides]);

  return (
    <div className="stoxly-card space-y-4">
      <h2 className="text-h3">Holdings</h2>

      {isLoading && <HoldingsTableSkeleton />}

      {isError && (
        <p className="text-body text-danger py-4">Failed to load holdings.</p>
      )}

      {!isLoading && !isError && (!holdings || holdings.length === 0) && (
        <p className="text-body text-muted py-4 text-center italic">
          No holdings yet. Add a BUY transaction to get started.
        </p>
      )}

      {holdings && holdings.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Avg Price</TableHead>
              <TableHead className="text-right">Current Price</TableHead>
              <TableHead className="text-right">Invested</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Profit / Loss</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => {
              const overridePrice = priceOverrides?.[holding.symbol]?.price;
              const effectivePrice = overridePrice ?? holding.currentPrice;
              const value = computeValue(holding, overridePrice);
              const unrealized = computeUnrealizedProfit(
                holding,
                overridePrice,
              );
              const totalPnl =
                unrealized === null
                  ? null
                  : unrealized + holding.realizedProfit;
              const flash = flashMap[holding.symbol];

              return (
                <TableRow
                  key={holding.symbol}
                  className={cn(
                    "transition-colors duration-700",
                    flash === "up" && "bg-success/10",
                    flash === "down" && "bg-danger/10",
                  )}
                >
                  <TableCell className="font-semibold text-text-primary">
                    {holding.symbol}
                  </TableCell>
                  <TableCell className="text-right text-text-secondary">
                    {formatQuantity(holding.quantity)}
                  </TableCell>
                  <TableCell className="text-right text-text-secondary">
                    {formatCurrency(holding.averagePrice)}
                  </TableCell>
                  <TableCell className="text-right text-text-secondary">
                    {formatCurrency(effectivePrice)}
                  </TableCell>
                  <TableCell className="text-right text-text-secondary">
                    {formatCurrency(holding.invested)}
                  </TableCell>
                  <TableCell className="text-right text-text-secondary">
                    {formatCurrency(value)}
                  </TableCell>
                  <ProfitCell value={totalPnl} />
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
