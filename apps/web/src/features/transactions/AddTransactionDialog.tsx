"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { useToast } from "@/hooks/use-toast";
import type { CreateTransactionRequest, TransactionType } from "@/types/transaction";

interface AddTransactionDialogProps {
  portfolioId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultForm(): CreateTransactionRequest {
  return { symbol: "", type: "BUY", quantity: 0, price: 0, fee: 0, tradeDate: todayISO(), notes: "" };
}

export default function AddTransactionDialog({
  portfolioId,
  open,
  onOpenChange,
}: AddTransactionDialogProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<CreateTransactionRequest>(defaultForm);
  const { mutate: create, isPending } = useCreateTransaction(portfolioId);

  function set<K extends keyof CreateTransactionRequest>(key: K, value: CreateTransactionRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create(
      { ...form, symbol: form.symbol.trim().toUpperCase() },
      {
        onSuccess: () => {
          toast("Transaction added", "success");
          setForm(defaultForm());
          onOpenChange(false);
        },
        onError: (err) => {
          toast(err.message || "Failed to add transaction", "error");
        },
      },
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-sm">
          <Dialog.Title className="text-h3 mb-4">Add Transaction</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-small text-text-secondary mb-1 block">Symbol</label>
              <input
                className="stoxly-input w-full"
                placeholder="e.g. AAPL"
                value={form.symbol}
                onChange={(e) => set("symbol", e.target.value)}
                required
                maxLength={20}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-small text-text-secondary mb-1 block">Type</label>
                <select
                  className="stoxly-input w-full"
                  value={form.type}
                  onChange={(e) => set("type", e.target.value as TransactionType)}
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
              <div>
                <label className="text-small text-text-secondary mb-1 block">Trade Date</label>
                <input
                  type="date"
                  className="stoxly-input w-full"
                  value={form.tradeDate}
                  onChange={(e) => set("tradeDate", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-small text-text-secondary mb-1 block">Quantity</label>
                <input
                  type="number"
                  className="stoxly-input w-full"
                  placeholder="0"
                  value={form.quantity || ""}
                  onChange={(e) => set("quantity", parseFloat(e.target.value) || 0)}
                  min="0.00000001"
                  step="any"
                  required
                />
              </div>
              <div>
                <label className="text-small text-text-secondary mb-1 block">Price</label>
                <input
                  type="number"
                  className="stoxly-input w-full"
                  placeholder="0.00"
                  value={form.price || ""}
                  onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="any"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-small text-text-secondary mb-1 block">Fee (optional)</label>
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
              <label className="text-small text-text-secondary mb-1 block">Notes (optional)</label>
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
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding..." : "Add Transaction"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
