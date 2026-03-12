"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { useToast } from "@/hooks/use-toast";
import StockSearch from "@/features/market/components/StockSearch";
import type {
  CreateTransactionRequest,
  TransactionType,
} from "@/types/transaction";
import type { SymbolSearchResult } from "@/types/market";

interface AddTransactionDialogProps {
  portfolioId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// datetime-local inputs work in LOCAL time, not UTC.
// Subtract the timezone offset to get the local wall-clock time in ISO format.
function nowLocalISO(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function defaultForm(): CreateTransactionRequest {
  return {
    symbol: "",
    type: "BUY",
    quantity: 0,
    price: 0,
    fee: 0,
    tradeDate: nowLocalISO(),
    notes: "",
  };
}

export default function AddTransactionDialog({
  portfolioId,
  open,
  onOpenChange,
}: AddTransactionDialogProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<CreateTransactionRequest>(defaultForm);
  const [selectedSymbol, setSelectedSymbol] =
    useState<SymbolSearchResult | null>(null);
  // Incrementing this key forces StockSearch to remount and clear its input
  // whenever the dialog opens, preventing stale search text.
  const [searchKey, setSearchKey] = useState(0);
  const { mutate: create, isPending } = useCreateTransaction(portfolioId);

  // Reset everything when the dialog opens
  function handleOpenChange(next: boolean) {
    if (next) {
      setForm(defaultForm());
      setSelectedSymbol(null);
      setSearchKey((k) => k + 1);
    }
    onOpenChange(next);
  }

  function set<K extends keyof CreateTransactionRequest>(
    key: K,
    value: CreateTransactionRequest[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.symbol) return;
    // form.tradeDate is a local-time string (from datetime-local input).
    // new Date(localString) parses it as local time; .toISOString() gives UTC.
    const tradeDateUtc = new Date(form.tradeDate).toISOString();
    create(
      {
        ...form,
        symbol: form.symbol.trim().toUpperCase(),
        tradeDate: tradeDateUtc,
      },
      {
        onSuccess: () => {
          toast("Transaction added", "success");
          setForm(defaultForm());
          setSelectedSymbol(null);
          setSearchKey((k) => k + 1);
          onOpenChange(false);
        },
        onError: (err) => {
          toast(err.message || "Failed to add transaction", "error");
        },
      },
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-sm">
          <Dialog.Title className="text-h3 mb-4">Add Transaction</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-small text-text-secondary mb-1 block">
                Symbol
              </label>

              {selectedSymbol ? (
                // Selected symbol chip — mirrors the dropdown item style
                <div className="flex items-center justify-between rounded-xl border border-primary/40 bg-primary/5 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-body truncate font-medium text-text-primary">
                      {selectedSymbol.name || selectedSymbol.symbol}
                    </p>
                    <p className="text-small mt-0.5">
                      <span className="font-semibold text-text-primary">
                        {selectedSymbol.symbol}
                      </span>
                      {selectedSymbol.exchange && (
                        <span className="text-muted">
                          {" "}
                          &bull; {selectedSymbol.exchange}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ml-3 shrink-0 text-muted transition-colors hover:text-danger"
                    aria-label="Change symbol"
                    onClick={() => {
                      setSelectedSymbol(null);
                      set("symbol", "");
                      setSearchKey((k) => k + 1);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L8 6.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L9.06 8l4.72 4.72a.75.75 0 1 1-1.06 1.06L8 9.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L6.94 8 2.22 3.28a.75.75 0 0 1 0-1.06Z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <StockSearch
                  key={searchKey}
                  placeholder="Search symbol or company…"
                  onSelect={(result: SymbolSearchResult) => {
                    setSelectedSymbol(result);
                    set("symbol", result.symbol.toUpperCase());
                  }}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-small text-text-secondary mb-1 block">
                  Type
                </label>
                <select
                  className="stoxly-input w-full"
                  value={form.type}
                  onChange={(e) =>
                    set("type", e.target.value as TransactionType)
                  }
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
              <div>
                <label className="text-small text-text-secondary mb-1 block">
                  Trade Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  className="stoxly-input w-full"
                  value={form.tradeDate}
                  onChange={(e) => set("tradeDate", e.target.value)}
                  max={nowLocalISO()}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-small text-text-secondary mb-1 block">
                  Quantity
                </label>
                <input
                  type="number"
                  className="stoxly-input w-full"
                  placeholder="0"
                  value={form.quantity || ""}
                  onChange={(e) =>
                    set("quantity", parseFloat(e.target.value) || 0)
                  }
                  min="0.00000001"
                  step="any"
                  required
                />
              </div>
              <div>
                <label className="text-small text-text-secondary mb-1 block">
                  Price
                </label>
                <input
                  type="number"
                  className="stoxly-input w-full"
                  placeholder="0.00"
                  value={form.price || ""}
                  onChange={(e) =>
                    set("price", parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  step="any"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-small text-text-secondary mb-1 block">
                Fee (optional)
              </label>
              <input
                type="number"
                className="stoxly-input w-full"
                placeholder="0.00"
                value={form.fee || ""}
                onChange={(e) => set("fee", parseFloat(e.target.value) || 0)}
                min="0"
                step="any"
              />
            </div>

            <div>
              <label className="text-small text-text-secondary mb-1 block">
                Notes (optional)
              </label>
              <textarea
                className="stoxly-input w-full resize-none"
                rows={2}
                placeholder="Any notes about this trade"
                value={form.notes ?? ""}
                onChange={(e) => set("notes", e.target.value)}
                maxLength={500}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !form.symbol}>
                {isPending ? "Adding..." : "Add Transaction"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
