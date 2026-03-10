"use client";

import { Eye, RadioTower } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QueryState } from "@/components/ui/query-state";
import { useLiveStockPrices } from "@/hooks/use-live-stock-prices";
import { useWatchlistQuery } from "@/hooks/use-watchlist-query";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function WatchlistPreview() {
  const { data, error, isLoading } = useWatchlistQuery();
  const watchlist = data ?? [];

  const livePrices = useLiveStockPrices(watchlist.map((stock) => stock.symbol));

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>Watchlist stream</CardTitle>
          <CardDescription>
            Watchlist cards are service-driven and ready to refresh from
            SignalR.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-surface-muted px-4 py-2 text-sm text-muted">
          <RadioTower className="h-4 w-4" />
          Subscribed to priceUpdated events
        </div>
      </CardHeader>
      <CardContent>
        <QueryState
          error={error instanceof Error ? error : null}
          emptyMessage="Add symbols to the watchlist API to see them here."
          hasData={watchlist.length > 0}
          isLoading={isLoading}
          loadingMessage="Loading watchlist..."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {watchlist.map((stock) => {
              const livePrice =
                livePrices[stock.symbol]?.price ?? stock.latestPrice ?? 0;

              return (
                <div
                  key={stock.symbol}
                  className="rounded-[24px] border border-border bg-white/70 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-foreground">
                        {stock.symbol}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {stock.companyName}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-primary">
                      <Eye className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <p className="text-sm text-muted">Latest price</p>
                      <p className="mt-1 text-2xl font-semibold tracking-tight">
                        {livePrice > 0
                          ? priceFormatter.format(livePrice)
                          : "Waiting"}
                      </p>
                    </div>
                    <p className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-muted">
                      live
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </QueryState>
      </CardContent>
    </Card>
  );
}
