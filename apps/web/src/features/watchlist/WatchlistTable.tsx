"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRemoveFromWatchlist } from "@/hooks/use-watchlist";
import { useToast } from "@/hooks/use-toast";
import type { PriceUpdateDto } from "@/types/market";
import type { WatchlistItem } from "@/types/watchlist";

interface WatchlistTableProps {
  items: WatchlistItem[];
  /** Live price overrides from SignalR, keyed by uppercase symbol. */
  priceOverrides?: Record<string, PriceUpdateDto>;
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatChange(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatRawChange(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

function changeColorClass(value: number | null | undefined): string {
  if (value === null || value === undefined) return "text-text-secondary";
  if (value > 0) return "text-success";
  if (value < 0) return "text-danger";
  return "text-text-secondary";
}

function WatchlistTableSkeleton() {
  const rows = ["sk-0", "sk-1", "sk-2", "sk-3"];
  return (
    <div className="space-y-2">
      {rows.map((key) => (
        <div key={key} className="h-12 animate-pulse rounded-xl bg-surface" />
      ))}
    </div>
  );
}

export function WatchlistTableSkeleton2() {
  return <WatchlistTableSkeleton />;
}

export default function WatchlistTable({
  items,
  priceOverrides,
}: Readonly<WatchlistTableProps>) {
  const { toast } = useToast();
  const { mutate: remove, isPending: isRemoving } = useRemoveFromWatchlist();
  const router = useRouter();

  // Flash animation — same pattern as HoldingsTable
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

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-body text-muted italic">
        Your watchlist is empty. Add a stock to start tracking it.
      </p>
    );
  }

  function handleRemove(symbol: string) {
    remove(symbol, {
      onSuccess: () => toast(`${symbol} removed from watchlist`, "success"),
      onError: () => toast(`Failed to remove ${symbol}`, "error"),
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Company</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Change</TableHead>
          <TableHead className="text-right">Change %</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const override = priceOverrides?.[item.symbol];
          const effectivePrice = override?.price ?? item.currentPrice;
          const effectiveChange = override?.change ?? item.change;
          const effectiveChangePercent =
            override?.changePercent ?? item.changePercent;
          const flash = flashMap[item.symbol];

          return (
            <TableRow
              key={item.symbol}
              className={cn(
                "cursor-pointer transition-colors duration-700 hover:bg-surface",
                flash === "up" && "bg-success/10",
                flash === "down" && "bg-danger/10",
              )}
              onClick={() => router.push(`/watchlist/${item.symbol}`)}
            >
              <TableCell className="font-semibold text-text-primary">
                {item.symbol}
              </TableCell>
              <TableCell className="text-text-secondary">
                {item.companyName ?? "—"}
              </TableCell>
              <TableCell className="text-right text-text-secondary">
                {formatCurrency(effectivePrice)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium",
                  changeColorClass(effectiveChange),
                )}
              >
                {formatRawChange(effectiveChange)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium",
                  changeColorClass(effectiveChangePercent),
                )}
              >
                {formatChange(effectiveChangePercent)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted hover:text-danger"
                  disabled={isRemoving}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.symbol);
                  }}
                  aria-label={`Remove ${item.symbol} from watchlist`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
