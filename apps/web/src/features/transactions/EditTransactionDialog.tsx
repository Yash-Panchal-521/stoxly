"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateTransaction } from "@/hooks/use-transactions";
import { useToast } from "@/hooks/use-toast";
import type { TransactionResponse } from "@/types/transaction";

interface EditTransactionDialogProps {
  readonly transaction: TransactionResponse;
  readonly portfolioId: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export default function EditTransactionDialog({
  transaction,
  portfolioId,
  open,
  onOpenChange,
}: EditTransactionDialogProps) {
  const [fee, setFee] = useState(String(transaction.fee));
  const [notes, setNotes] = useState(transaction.notes ?? "");
  const { toast } = useToast();

  const { mutate, isPending } = useUpdateTransaction(portfolioId);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsedFee = Number.parseFloat(fee);
    if (Number.isNaN(parsedFee) || parsedFee < 0) return;

    mutate(
      {
        id: transaction.id,
        data: {
          portfolioId,
          fee: parsedFee,
          notes: notes.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast("Transaction updated", "success");
          onOpenChange(false);
        },
        onError: (err: Error) => {
          toast(err.message || "Failed to update transaction", "error");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update the fee or notes for this{" "}
            <span className="font-semibold text-text-primary">
              {transaction.type}
            </span>
            {" trade on "}
            <span className="font-semibold text-text-primary">
              {transaction.symbol}.
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="edit-fee">Fee ($)</Label>
            <Input
              id="edit-fee"
              type="number"
              min="0"
              step="0.01"
              className="stoxly-input"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">
              Notes <span className="text-muted text-small">(optional)</span>
            </Label>
            <Input
              id="edit-notes"
              className="stoxly-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              placeholder="Add a note about this trade"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
