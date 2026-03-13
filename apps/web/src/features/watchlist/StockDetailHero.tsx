"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useWatchlist,
} from "@/hooks/use-watchlist";
import { useToast } from "@/hooks/use-toast";
import type { PriceUpdateDto, StockPrice } from "@/types/market";

interface StockDetailHeroProps {
  readonly symbol: string;
  readonly companyName: string | null;
  readonly price: StockPrice | undefined;
  readonly livePrice: PriceUpdateDto | undefined;
}

function formatCurrency(v: number | undefined): string {
  if (v === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

export default function StockDetailHero({
  symbol,
  companyName,
  price,
  livePrice,
}: StockDetailHeroProps) {
  const { data: watchlist } = useWatchlist();
  const { mutate: add, isPending: isAdding } = useAddToWatchlist();
  const { mutate: remove, isPending: isRemoving } = useRemoveFromWatchlist();
  const { toast } = useToast();

  const effectivePrice = livePrice?.price ?? price?.currentPrice;
  const effectiveChange = livePrice?.change ?? price?.change;
  const effectiveChangePct = livePrice?.changePercent ?? price?.changePercent;

  const isOnWatchlist = watchlist?.some((w) => w.symbol === symbol) ?? false;

  const prevPriceRef = useRef<number | undefined>(undefined);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (livePrice?.price === undefined) return;
    if (
      prevPriceRef.current !== undefined &&
      prevPriceRef.current !== livePrice.price
    ) {
      const dir = livePrice.price > prevPriceRef.current ? "up" : "down";
      setFlash(dir);
      const t = setTimeout(() => setFlash(null), 700);
      return () => clearTimeout(t);
    }
    prevPriceRef.current = livePrice.price;
  }, [livePrice?.price]);

  const isPositive = (effectiveChangePct ?? 0) >= 0;

  function handleToggleWatchlist() {
    if (isOnWatchlist) {
      remove(symbol, {
        onSuccess: () => toast(`${symbol} removed from watchlist`, "success"),
        onError: () => toast(`Failed to remove ${symbol}`, "error"),
      });
    } else {
      add(
        { symbol },
        {
          onSuccess: () => toast(`${symbol} added to watchlist`, "success"),
          onError: () => toast(`Failed to add ${symbol}`, "error"),
        },
      );
    }
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      {/* Left — symbol + live price */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-h1 font-bold text-text-primary">{symbol}</h1>
          {companyName && (
            <span className="rounded-lg border border-border bg-surface px-2 py-0.5 text-small text-text-secondary">
              {companyName}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-3">
          <span
            className={cn(
              "text-h1 font-bold transition-colors duration-700",
              flash === "up" && "text-success",
              flash === "down" && "text-danger",
              flash === null && "text-text-primary",
            )}
          >
            {formatCurrency(effectivePrice)}
          </span>

          {(effectiveChange !== undefined ||
            effectiveChangePct !== undefined) && (
            <span
              className={cn(
                "text-body font-medium",
                isPositive ? "text-success" : "text-danger",
              )}
            >
              {isPositive ? "+" : ""}
              {(effectiveChange ?? 0).toFixed(2)}{" "}
              <span className="text-small">
                ({isPositive ? "+" : ""}
                {(effectiveChangePct ?? 0).toFixed(2)}%)
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Right — watchlist toggle */}
      <Button
        className={isOnWatchlist ? "btn-danger" : "btn-primary"}
        onClick={handleToggleWatchlist}
        disabled={isAdding || isRemoving}
      >
        {isOnWatchlist ? (
          <>
            <Minus className="mr-2 h-4 w-4" />
            Remove from Watchlist
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add to Watchlist
          </>
        )}
      </Button>
    </div>
  );
}
