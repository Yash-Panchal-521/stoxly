"use client";

import { useState } from "react";
import {
  useTransactions,
  useDeleteTransaction,
} from "@/hooks/use-transactions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddTransactionDialog from "./AddTransactionDialog";
import EditTransactionDialog from "./EditTransactionDialog";
import type { TransactionResponse } from "@/types/transaction";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatQuantity(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
}

interface TransactionRowProps {
  transaction: TransactionResponse;
  portfolioId: string;
}

function TransactionTableRow({
  transaction,
  portfolioId,
}: TransactionRowProps) {
  const { toast } = useToast();
  const { mutate: del, isPending } = useDeleteTransaction(portfolioId);
  const [editOpen, setEditOpen] = useState(false);

  function handleDelete() {
    del(transaction.id, {
      onSuccess: () => toast("Transaction deleted", "success"),
      onError: (err) => toast(err.message || "Failed to delete", "error"),
    });
  }

  const isBuy = transaction.type === "BUY";

  return (
    <>
      <TableRow>
        <TableCell className="text-text-secondary">
          {formatDate(transaction.tradeDate)}
        </TableCell>
        <TableCell className="font-semibold text-text-primary">
          {transaction.symbol}
        </TableCell>
        <TableCell>
          <span
            className={`inline-block rounded px-2 py-0.5 text-small font-semibold ${
              isBuy ? "trend-up" : "trend-down"
            }`}
          >
            {transaction.type}
          </span>
        </TableCell>
        <TableCell className="text-right text-text-primary">
          {formatQuantity(transaction.quantity)}
        </TableCell>
        <TableCell className="text-right text-text-primary">
          ${formatCurrency(transaction.price)}
        </TableCell>
        <TableCell className="text-right font-semibold text-text-primary">
          ${formatCurrency(transaction.total)}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setEditOpen(true)}
              className="text-small text-muted hover:text-text-primary transition-all duration-150 ease-in-out"
              aria-label="Edit transaction"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-small text-muted hover:text-danger transition-all duration-150 ease-in-out disabled:opacity-50"
              aria-label="Delete transaction"
            >
              {isPending ? "..." : "Delete"}
            </button>
          </div>
        </TableCell>
      </TableRow>
      <EditTransactionDialog
        transaction={transaction}
        portfolioId={portfolioId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}

interface TransactionListProps {
  portfolioId: string;
}

export default function TransactionList({ portfolioId }: TransactionListProps) {
  const {
    data: transactions,
    isLoading,
    isError,
  } = useTransactions(portfolioId);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="stoxly-card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-h3">Transactions</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          + Add
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-small text-danger py-4 text-center">
          Failed to load transactions.
        </p>
      )}

      {!isLoading && !isError && transactions?.length === 0 && (
        <div className="py-10 text-center">
          <p className="text-body text-muted">No transactions yet.</p>
          <p className="text-small text-muted mt-1">
            Add your first trade to get started.
          </p>
        </div>
      )}

      {!isLoading && !isError && transactions && transactions.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TransactionTableRow
                key={tx.id}
                transaction={tx}
                portfolioId={portfolioId}
              />
            ))}
          </TableBody>
        </Table>
      )}

      <AddTransactionDialog
        portfolioId={portfolioId}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
    </div>
  );
}
