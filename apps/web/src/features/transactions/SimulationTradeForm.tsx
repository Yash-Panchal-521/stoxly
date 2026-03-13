"use client";

import { useEffect, useState } from "react";
import StockSearch from "@/features/market/components/StockSearch";
import OrderConfirmationDialog from "@/features/transactions/OrderConfirmationDialog";
import {
  useSimulationBuy,
  useSimulationSell,
} from "@/hooks/use-simulation-trade";
import { useSimulationPortfolio } from "@/hooks/use-simulation-portfolio";
import { useHoldings } from "@/hooks/use-holdings";
import { useStockPrice } from "@/hooks/use-stock-detail";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { SymbolSearchResult } from "@/types/market";

type Side = "BUY" | "SELL";

interface SimulationTradeFormProps {
  portfolioId: string;
  /** Called after a successful trade. */
  onSuccess?: () => void;
}

function fmt(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function SimulationTradeForm({
  portfolioId,
  onSuccess,
}: Readonly<SimulationTradeFormProps>) {
  const [side, setSide] = useState<Side>("BUY");
  const [selectedSymbol, setSelectedSymbol] =
    useState<SymbolSearchResult | null>(null);
  const [searchKey, setSearchKey] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [snapshotPrice, setSnapshotPrice] = useState(0);
  const [noteOpen, setNoteOpen] = useState(false);

  const { data: portfolio } = useSimulationPortfolio();
  const { data: holdings } = useHoldings(portfolioId);
  const { data: priceData, dataUpdatedAt: priceUpdatedAt } = useStockPrice(
    selectedSymbol?.symbol ?? "",
  );

  const buyMutation = useSimulationBuy();
  const sellMutation = useSimulationSell();

  const isPending = buyMutation.isPending || sellMutation.isPending;

  const cashBalance = portfolio?.cashBalance ?? 0;
  const livePrice = priceData?.currentPrice ?? 0;
  const qty = parseFloat(quantity) || 0;
  const estimatedTotal = qty > 0 && livePrice > 0 ? qty * livePrice : null;

  // Available quantity for sells
  const holding = holdings?.find(
    (h) =>
      h.symbol.toUpperCase() === (selectedSymbol?.symbol ?? "").toUpperCase(),
  );
  const availableQuantity = holding?.quantity ?? 0;

  // Client-side guards
  const insufficientCash =
    side === "BUY" && estimatedTotal !== null && estimatedTotal > cashBalance;

  const insufficientHoldings =
    side === "SELL" && qty > 0 && qty > availableQuantity;

  const noteTooLong = notes.length > 500;

  const canReview =
    !!selectedSymbol &&
    qty > 0 &&
    livePrice > 0 &&
    !insufficientCash &&
    !insufficientHoldings &&
    !noteTooLong;

  // Reset symbol selection when switching sides
  function handleSideChange(newSide: Side) {
    setSide(newSide);
    setFormError(null);
    setServerError(null);
    setNoteOpen(false);
    setNotes("");
  }

  function handleSymbolSelect(result: SymbolSearchResult) {
    setSelectedSymbol(result);
    setFormError(null);
    setServerError(null);
  }

  function handleSellAll() {
    if (availableQuantity > 0) {
      setQuantity(availableQuantity.toString());
    }
  }

  function handleReview() {
    if (!canReview) return;
    setServerError(null);
    setSnapshotPrice(livePrice);
    setConfirmOpen(true);
  }

  function handleConfirm() {
    if (!selectedSymbol || qty <= 0) return;
    setServerError(null);

    const payload = {
      portfolioId,
      symbol: selectedSymbol.symbol,
      quantity: qty,
      notes: notes.trim() || undefined,
    };

    const handleError = (error: unknown) => {
      setConfirmOpen(false);
      if (error instanceof ApiError) {
        if (error.code === "PriceUnavailable") {
          setFormError(
            "Price is currently unavailable for this symbol. Try again shortly.",
          );
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      }
    };

    const handleSuccess = () => {
      setConfirmOpen(false);
      setSelectedSymbol(null);
      setSearchKey((k) => k + 1);
      setQuantity("");
      setNotes("");
      setFormError(null);
      onSuccess?.();
    };

    if (side === "BUY") {
      buyMutation.mutate(payload, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    } else {
      sellMutation.mutate(payload, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    }
  }

  return (
    <div className="stoxly-card p-5 space-y-5">
      {/* BUY / SELL toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden text-body font-medium w-fit">
        <button
          type="button"
          onClick={() => handleSideChange("BUY")}
          className={cn(
            "px-6 py-2 transition-all duration-150 ease-in-out",
            side === "BUY"
              ? "bg-success/20 text-success"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => handleSideChange("SELL")}
          className={cn(
            "px-6 py-2 transition-all duration-150 ease-in-out border-l border-border",
            side === "SELL"
              ? "bg-danger/20 text-danger"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          Sell
        </button>
      </div>

      {/* Symbol search */}
      <div className="space-y-1">
        <label className="text-small text-text-secondary">Symbol</label>
        <StockSearch
          key={searchKey}
          onSelect={handleSymbolSelect}
          placeholder="Search symbol or company…"
        />
        {selectedSymbol && (
          <p className="text-small text-text-secondary">
            {selectedSymbol.name} &middot; {selectedSymbol.exchange}
          </p>
        )}
      </div>

      {/* Live price */}
      {selectedSymbol && (
        <div className="flex items-center justify-between text-body">
          <span className="text-text-secondary">Market Price</span>
          <div className="text-right">
            <span className="text-text-primary font-semibold">
              {livePrice > 0 ? fmt(livePrice) : "—"}
            </span>
            {livePrice > 0 && priceUpdatedAt > 0 && (
              <p className="text-small text-muted">
                as of{" "}
                {new Date(priceUpdatedAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Available cash / holdings info */}
      {side === "BUY" ? (
        <div className="flex items-center justify-between text-body">
          <span className="text-text-secondary">Available Cash</span>
          <span className="text-text-primary">{fmt(cashBalance)}</span>
        </div>
      ) : (
        selectedSymbol && (
          <div className="flex items-center justify-between text-body">
            <span className="text-text-secondary">Shares Held</span>
            <span className="text-text-primary">
              {availableQuantity > 0 ? availableQuantity : "—"}
            </span>
          </div>
        )
      )}

      {/* Quantity input */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-small text-text-secondary">Quantity</label>
          {side === "SELL" && availableQuantity > 0 && (
            <button
              type="button"
              className="text-small text-primary hover:underline transition-all duration-150 ease-in-out"
              onClick={handleSellAll}
            >
              Sell All
            </button>
          )}
        </div>
        <input
          type="number"
          min="0"
          step="any"
          className="stoxly-input w-full"
          placeholder="0"
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            setFormError(null);
          }}
        />
      </div>

      {/* Notes — collapsible */}
      {noteOpen ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-small text-text-secondary font-medium">
              Note / Reason
            </label>
            <button
              type="button"
              className="text-small text-muted hover:text-text-secondary transition-all duration-150 ease-in-out"
              onClick={() => {
                setNoteOpen(false);
                setNotes("");
              }}
            >
              Remove
            </button>
          </div>
          <textarea
            className={cn(
              "stoxly-input w-full resize-none",
              noteTooLong && "border-danger focus:border-danger",
            )}
            rows={3}
            placeholder="Why are you making this trade? (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <p
            className={cn(
              "text-small text-right",
              noteTooLong ? "text-danger" : "text-muted",
            )}
          >
            {notes.length} / 500
          </p>
          {noteTooLong && (
            <p className="text-small text-danger">
              Note must not exceed 500 characters.
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          className="text-small text-text-secondary hover:text-text-primary transition-all duration-150 ease-in-out w-fit"
          onClick={() => setNoteOpen(true)}
        >
          + Add a note
        </button>
      )}

      {/* Estimated cost / proceeds */}
      {estimatedTotal !== null && (
        <div className="flex items-center justify-between text-body border-t border-border pt-3">
          <span className="text-text-secondary">
            {side === "BUY" ? "Estimated Cost" : "Estimated Proceeds"}
          </span>
          <span className="text-text-primary font-semibold">
            {fmt(estimatedTotal)}
          </span>
        </div>
      )}

      {/* Client-side warnings */}
      {insufficientCash && estimatedTotal !== null && (
        <p className="text-small text-danger">
          Estimated cost ({fmt(estimatedTotal)}) exceeds your available cash (
          {fmt(cashBalance)}).
        </p>
      )}
      {insufficientHoldings && (
        <p className="text-small text-danger">
          You only hold {availableQuantity} share
          {availableQuantity !== 1 ? "s" : ""} of {selectedSymbol?.symbol}.
        </p>
      )}

      {/* Server / form error */}
      {formError && <p className="text-small text-danger">{formError}</p>}

      {/* Review Order button */}
      <button
        type="button"
        className={cn(
          "w-full transition-all duration-150 ease-in-out",
          side === "BUY" ? "btn-primary" : "btn-danger",
          !canReview && "opacity-50 cursor-not-allowed",
        )}
        disabled={!canReview || isPending}
        onClick={handleReview}
      >
        Review Order
      </button>

      {/* Confirmation dialog */}
      <OrderConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        order={
          selectedSymbol && snapshotPrice > 0
            ? {
                portfolioId,
                symbol: selectedSymbol.symbol,
                side,
                quantity: qty,
                price: snapshotPrice,
                cashBalance,
                availableQuantity:
                  side === "SELL" ? availableQuantity : undefined,
                notes: notes.trim() || undefined,
              }
            : null
        }
        isPending={isPending}
        serverError={serverError}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
