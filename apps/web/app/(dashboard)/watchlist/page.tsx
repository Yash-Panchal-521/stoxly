"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/use-watchlist";
import { usePriceSocket } from "@/hooks/use-price-socket";
import WatchlistTable from "@/features/watchlist/WatchlistTable";
import AddToWatchlistDialog from "@/features/watchlist/AddToWatchlistDialog";

function WatchlistSkeleton() {
  const rows = ["sk-0", "sk-1", "sk-2", "sk-3"];
  return (
    <div className="space-y-2">
      {rows.map((key) => (
        <div key={key} className="h-12 animate-pulse rounded-xl bg-surface" />
      ))}
    </div>
  );
}

export default function WatchlistPage() {
  const { data: items, isLoading, isError } = useWatchlist();
  const [dialogOpen, setDialogOpen] = useState(false);

  const symbols = useMemo(() => items?.map((i) => i.symbol) ?? [], [items]);

  const priceOverrides = usePriceSocket(symbols);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Watchlist</h1>
          <p className="mt-1 text-body text-text-secondary">
            Track stock prices in real-time without holding them.
          </p>
        </div>
        <Button className="btn-primary" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Stock
        </Button>
      </div>

      {/* Table */}
      <div className="stoxly-card">
        {isLoading && <WatchlistSkeleton />}

        {isError && (
          <p className="py-4 text-body text-danger">
            Failed to load watchlist.
          </p>
        )}

        {!isLoading && !isError && (
          <WatchlistTable items={items ?? []} priceOverrides={priceOverrides} />
        )}
      </div>

      <AddToWatchlistDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
