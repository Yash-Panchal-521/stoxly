"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import StockSearch from "@/features/market/components/StockSearch";
import { useAddToWatchlist } from "@/hooks/use-watchlist";
import { useToast } from "@/hooks/use-toast";
import type { SymbolSearchResult } from "@/types/market";

interface AddToWatchlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddToWatchlistDialog({
  open,
  onOpenChange,
}: Readonly<AddToWatchlistDialogProps>) {
  const { toast } = useToast();
  const { mutate: add, isPending } = useAddToWatchlist();
  const [searchKey, setSearchKey] = useState(0);

  function handleOpenChange(next: boolean) {
    if (next) setSearchKey((k) => k + 1);
    onOpenChange(next);
  }

  function handleSelect(result: SymbolSearchResult) {
    add(
      { symbol: result.symbol },
      {
        onSuccess: () => {
          toast(`${result.symbol} added to watchlist`, "success");
          onOpenChange(false);
        },
        onError: (err) => {
          const message = err.message || "Failed to add to watchlist";
          toast(message, "error");
        },
      },
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg"
          aria-describedby={undefined}
        >
          <Dialog.Title className="mb-1 text-h3 text-text-primary">
            Add to Watchlist
          </Dialog.Title>
          <p className="mb-5 text-body text-text-secondary">
            Search for a stock and select it to start tracking its price.
          </p>

          <StockSearch
            key={searchKey}
            placeholder="Search symbol or company…"
            onSelect={handleSelect}
          />

          {isPending && (
            <p className="mt-3 text-small text-text-secondary">Adding…</p>
          )}

          <div className="mt-5 flex justify-end">
            <Dialog.Close asChild>
              <button className="btn-ghost text-small" disabled={isPending}>
                Cancel
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
