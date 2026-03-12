"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { useToast } from "@/hooks/use-toast";
import StockSearch from "@/features/market/components/StockSearch";
import { getHistoricalPrice } from "@/services/market-service";
import { cn } from "@/lib/utils";
import type { CreateTransactionRequest } from "@/types/transaction";
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
}: Readonly<AddTransactionDialogProps>) {
  const { toast } = useToast();
  const [form, setForm] = useState<CreateTransactionRequest>(defaultForm);
  const [selectedSymbol, setSelectedSymbol] =
    useState<SymbolSearchResult | null>(null);
  // Incrementing this key forces StockSearch to remount and clear its input
  // whenever the dialog opens, preventing stale search text.
  const [searchKey, setSearchKey] = useState(0);
  const { mutate: create, isPending } = useCreateTransaction(portfolioId);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [priceSource, setPriceSource] = useState<"live" | "historical" | null>(
    null,
  );
  const [priceNotFound, setPriceNotFound] = useState(false);

  // Fetch price from the backend whenever symbol + date change.
  // Today  → Finnhub live quote via GET /market/historical-price
  // Past   → AlphaVantage closing price via GET /market/historical-price
  // Future → skipped (no data can exist yet)
  // Debounced 600 ms to avoid firing on every keystroke while editing the date.
  useEffect(() => {
    const symbol = selectedSymbol?.symbol;
    const dateStr = form.tradeDate ? form.tradeDate.slice(0, 10) : null;
    const todayStr = new Date().toISOString().slice(0, 10);

    // Reset price state immediately whenever inputs change.
    set("price", 0);
    setSuggestedPrice(null);
    setPriceSource(null);
    setPriceNotFound(false);

    if (!symbol || !dateStr || dateStr > todayStr) return;

    const isToday = dateStr === todayStr;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsFetchingPrice(true);
      try {
        const result = await getHistoricalPrice(symbol, dateStr);
        if (!cancelled) {
          if (result) {
            set("price", result.price);
            setSuggestedPrice(result.price);
            setPriceSource(isToday ? "live" : "historical");
          } else {
            setPriceNotFound(true);
          }
        }
      } finally {
        if (!cancelled) setIsFetchingPrice(false);
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedSymbol?.symbol, form.tradeDate]);

  // Reset everything when the dialog opens
  function handleOpenChange(next: boolean) {
    if (next) {
      setForm(defaultForm());
      setSelectedSymbol(null);
      setSearchKey((k) => k + 1);
      setSuggestedPrice(null);
      setPriceSource(null);
      setPriceNotFound(false);
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
        {/* Deep frosted-glass backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-3xl" />

        {/* Sheet panel */}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-border/40 bg-surface shadow-2xl">
          {/* ── Header ── */}
          <div className="relative flex items-center justify-center border-b border-border/30 px-6 py-4">
            <Dialog.Title className="text-[15px] font-semibold tracking-tight text-text-primary">
              Add Transaction
            </Dialog.Title>
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 flex h-7 w-7 items-center justify-center rounded-full bg-card/80 text-muted transition-colors hover:text-text-primary"
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

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 px-5 py-5"
          >
            {/* ── Symbol ── */}
            <div className="rounded-2xl bg-card/60 px-4 py-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted">
                Stock Symbol
              </p>
              {selectedSymbol ? (
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-text-primary">
                      {selectedSymbol.symbol}
                    </p>
                    {selectedSymbol.name && (
                      <p className="text-[12px] text-muted truncate">
                        {selectedSymbol.name}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Change symbol"
                    onClick={() => {
                      setSelectedSymbol(null);
                      set("symbol", "");
                      set("price", 0);
                      setSearchKey((k) => k + 1);
                      setSuggestedPrice(null);
                      setPriceSource(null);
                      setPriceNotFound(false);
                    }}
                    className="ml-3 shrink-0 rounded-full bg-border/50 px-2.5 py-0.5 text-[11px] font-medium text-muted transition-colors hover:text-text-primary"
                  >
                    Change
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

            {/* ── BUY / SELL segmented control ── */}
            <div className="rounded-2xl bg-card/60 p-1.5">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => set("type", "BUY")}
                  className={cn(
                    "rounded-xl py-2.5 text-[13px] font-semibold tracking-wide transition-all duration-200",
                    form.type === "BUY"
                      ? "bg-success/20 text-success shadow-sm"
                      : "text-muted hover:text-text-secondary",
                  )}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => set("type", "SELL")}
                  className={cn(
                    "rounded-xl py-2.5 text-[13px] font-semibold tracking-wide transition-all duration-200",
                    form.type === "SELL"
                      ? "bg-danger/20 text-danger shadow-sm"
                      : "text-muted hover:text-text-secondary",
                  )}
                >
                  Sell
                </button>
              </div>
            </div>

            {/* ── Date ── */}
            <div className="rounded-2xl bg-card/60 px-4 py-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted">
                Trade Date &amp; Time
              </p>
              <input
                type="datetime-local"
                className="w-full bg-transparent text-[14px] text-text-primary outline-none [color-scheme:dark]"
                value={form.tradeDate}
                onChange={(e) => set("tradeDate", e.target.value)}
                max={nowLocalISO()}
                required
              />
            </div>

            {/* ── Quantity + Price ── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-card/60 px-4 py-3">
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-muted">
                  Quantity
                </p>
                <input
                  type="number"
                  className="w-full bg-transparent text-[18px] font-semibold text-text-primary outline-none placeholder:text-border"
                  placeholder="0"
                  value={form.quantity || ""}
                  onChange={(e) =>
                    set("quantity", Number.parseFloat(e.target.value) || 0)
                  }
                  min="0.00000001"
                  step="any"
                  required
                />
              </div>

              <div className="rounded-2xl bg-card/60 px-4 py-3">
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-muted">
                  Price
                  {isFetchingPrice && (
                    <span className="ml-1 animate-pulse text-primary">●</span>
                  )}
                </p>
                {suggestedPrice === null ? (
                  <PricePlaceholder
                    isFetching={isFetchingPrice}
                    notFound={priceNotFound}
                  />
                ) : (
                  <p className="text-[18px] font-semibold text-text-primary">
                    ${suggestedPrice.toFixed(2)}
                  </p>
                )}
                <input type="hidden" value={form.price} required />
                <PriceHint
                  priceSource={priceSource}
                  isFetching={isFetchingPrice}
                  notFound={priceNotFound}
                />
              </div>
            </div>

            {/* ── Fee ── */}
            <div className="rounded-2xl bg-card/60 px-4 py-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted">
                Fee{" "}
                <span className="normal-case tracking-normal text-border">
                  (optional)
                </span>
              </p>
              <input
                type="number"
                className="w-full bg-transparent text-[14px] text-text-primary outline-none placeholder:text-border"
                placeholder="0.00"
                value={form.fee || ""}
                onChange={(e) =>
                  set("fee", Number.parseFloat(e.target.value) || 0)
                }
                min="0"
                step="any"
              />
            </div>

            {/* ── Notes ── */}
            <div className="rounded-2xl bg-card/60 px-4 py-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted">
                Notes{" "}
                <span className="normal-case tracking-normal text-border">
                  (optional)
                </span>
              </p>
              <textarea
                className="w-full resize-none bg-transparent text-[14px] text-text-primary outline-none placeholder:text-border"
                rows={2}
                placeholder="Any notes about this trade"
                value={form.notes ?? ""}
                onChange={(e) => set("notes", e.target.value)}
                maxLength={500}
              />
            </div>

            {/* ── Actions ── */}
            <div className="mt-1 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="rounded-2xl bg-card py-3.5 text-[14px] font-semibold text-text-secondary transition-all duration-150 hover:bg-border/40 hover:text-text-primary disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isPending ||
                  !form.symbol ||
                  form.price === 0 ||
                  isFetchingPrice ||
                  priceNotFound
                }
                className={cn(
                  "rounded-2xl py-3.5 text-[14px] font-semibold text-white transition-all duration-150",
                  form.type === "BUY"
                    ? "bg-primary hover:bg-primary-hover disabled:bg-primary/40"
                    : "bg-danger hover:bg-danger/90 disabled:bg-danger/40",
                  "disabled:cursor-not-allowed",
                )}
              >
                {isPending ? "Adding…" : <ConfirmLabel type={form.type} />}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────

interface PriceHintProps {
  priceSource: "live" | "historical" | null;
  isFetching: boolean;
  notFound: boolean;
}

function PriceHint({
  priceSource,
  isFetching,
  notFound,
}: Readonly<PriceHintProps>) {
  if (isFetching || notFound || priceSource === null) return null;
  return (
    <p className="mt-1 text-[10px] text-muted">
      {priceSource === "live" ? "Live" : "Market close"}
    </p>
  );
}

function PricePlaceholder({
  isFetching,
  notFound,
}: Readonly<{ isFetching: boolean; notFound: boolean }>) {
  if (isFetching) {
    return <p className="text-[14px] text-muted">Fetching…</p>;
  }
  if (notFound) {
    return <p className="text-[14px] text-danger">No data</p>;
  }
  return <p className="text-[14px] text-muted">—</p>;
}

function ConfirmLabel({ type }: Readonly<{ type: string }>) {
  return <>{type === "BUY" ? "Confirm Buy" : "Confirm Sell"}</>;
}
