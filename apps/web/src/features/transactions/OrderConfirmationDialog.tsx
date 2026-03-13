"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { SimulationTradeResponse } from "@/types/transaction";

interface OrderSummary {
  portfolioId: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  cashBalance: number;
  availableQuantity?: number; // for sells
  notes?: string;
}

interface OrderConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderSummary | null;
  isPending: boolean;
  serverError: string | null;
  onConfirm: () => void;
}

function fmt(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function OrderConfirmationDialog({
  open,
  onOpenChange,
  order,
  isPending,
  serverError,
  onConfirm,
}: Readonly<OrderConfirmationDialogProps>) {
  if (!order) return null;

  const total = order.quantity * order.price;
  const cashAfter =
    order.side === "BUY"
      ? order.cashBalance - total
      : order.cashBalance + total;
  const quantityAfter =
    order.side === "SELL" && order.availableQuantity !== undefined
      ? order.availableQuantity - order.quantity
      : null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 stoxly-card p-6 rounded-xl border border-border shadow-sm">
          <Dialog.Title className="text-h3 text-text-primary mb-1">
            Review Order
          </Dialog.Title>
          <Dialog.Description className="text-body text-text-secondary mb-5">
            Confirm your{" "}
            <span
              className={
                order.side === "BUY"
                  ? "text-success font-medium"
                  : "text-danger font-medium"
              }
            >
              {order.side}
            </span>{" "}
            order before it executes.
          </Dialog.Description>

          <div className="space-y-3 text-body">
            <Row label="Symbol" value={order.symbol} />
            <Row label="Side">
              <span
                className={
                  order.side === "BUY"
                    ? "trend-up font-medium"
                    : "trend-down font-medium"
                }
              >
                {order.side}
              </span>
            </Row>
            <Row label="Quantity" value={order.quantity.toString()} />
            <Row label="Execution Price" value={`~${fmt(order.price)}`} />
            <div className="border-t border-border pt-3">
              <Row
                label={order.side === "BUY" ? "Total Cost" : "Est. Proceeds"}
                value={fmt(total)}
                emphasized
              />
              <Row label="Cash After Trade" value={fmt(cashAfter)} emphasized />
              {quantityAfter !== null && (
                <Row
                  label="Shares Remaining"
                  value={quantityAfter.toString()}
                />
              )}
            </div>

            {order.notes && (
              <p className="text-small text-text-secondary italic">
                Note: {order.notes}
              </p>
            )}

            <p className="text-small text-text-secondary">
              Price may vary slightly at execution.
            </p>
          </div>

          {serverError && (
            <p className="mt-4 text-small text-danger">{serverError}</p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className={order.side === "BUY" ? "btn-primary" : "btn-danger"}
              onClick={onConfirm}
              disabled={isPending}
            >
              {isPending
                ? "Executing…"
                : order.side === "BUY"
                  ? "Confirm Buy"
                  : "Confirm Sell"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Row({
  label,
  value,
  emphasized,
  children,
}: {
  label: string;
  value?: string;
  emphasized?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-secondary">{label}</span>
      <span
        className={
          emphasized ? "text-text-primary font-semibold" : "text-text-primary"
        }
      >
        {children ?? value}
      </span>
    </div>
  );
}
