"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useStockPrice } from "@/hooks/use-stock-detail";
import { usePriceSocket } from "@/hooks/use-price-socket";
import StockDetailHero from "@/features/watchlist/StockDetailHero";
import StockKeyStats from "@/features/watchlist/StockKeyStats";
import StockPriceChart from "@/features/watchlist/StockPriceChart";

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded-xl bg-surface" />
      <div className="stoxly-card space-y-4">
        <div className="h-10 w-48 animate-pulse rounded bg-surface" />
        <div className="h-8 w-64 animate-pulse rounded bg-surface" />
      </div>
      <div className="stoxly-card h-24 animate-pulse" />
      <div className="stoxly-card h-64 animate-pulse" />
    </div>
  );
}

export default function StockDetailPage() {
  const params = useParams<{ symbol: string }>();
  const router = useRouter();

  const symbol = params.symbol.toUpperCase();

  const { data: watchlist, isLoading: watchlistLoading } = useWatchlist();
  const { data: price, isLoading: priceLoading } = useStockPrice(symbol);

  const liveSymbols = useMemo(() => [symbol], [symbol]);
  const liveOverrides = usePriceSocket(liveSymbols);
  const livePrice = liveOverrides[symbol];

  const watchlistItem = watchlist?.find((w) => w.symbol === symbol);
  const companyName = watchlistItem?.companyName ?? null;

  const isLoading = watchlistLoading || priceLoading;

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <button
        onClick={() => router.push("/watchlist")}
        className="text-small text-text-secondary transition-all duration-150 ease-in-out hover:text-text-primary"
      >
        &larr; Back to Watchlist
      </button>

      {/* Hero — live price + watchlist toggle */}
      <div className="stoxly-card">
        <StockDetailHero
          symbol={symbol}
          companyName={companyName}
          price={price}
          livePrice={livePrice}
        />
      </div>

      {/* Key statistics */}
      <StockKeyStats price={price} />

      {/* Historical price chart */}
      <StockPriceChart symbol={symbol} />
    </div>
  );
}
