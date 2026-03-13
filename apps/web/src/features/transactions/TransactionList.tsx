"use client";

import { useState } from "react";
import {
  useTransactions,
  useDeleteTransaction,
  useUpdateTradeNote,
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
  isSimulation?: boolean;
}

function TransactionTableRow({
  transaction,
  portfolioId,
  isSimulation,
}: TransactionRowProps) {
  const { toast } = useToast();
  const { mutate: del, isPending } = useDeleteTransaction(portfolioId);
  const { mutate: saveNote, isPending: isSavingNote } =
    useUpdateTradeNote(portfolioId);
  const [editOpen, setEditOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [draftNote, setDraftNote] = useState("");

  function handleDelete() {
    del(transaction.id, {
      onSuccess: () => toast("Transaction deleted", "success"),
      onError: (err) => toast(err.message || "Failed to delete", "error"),
    });
  }

  function openNote() {
    setDraftNote(transaction.notes ?? "");
    setNoteOpen(true);
  }

  function handleSaveNote() {
    saveNote(
      { id: transaction.id, notes: draftNote.trim() || null },
      {
        onSuccess: () => {
          setNoteOpen(false);
          toast("Note saved", "success");
        },
        onError: (err) => toast(err.message || "Failed to save note", "error"),
      },
    );
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
            {isSimulation && (
              <button
                onClick={openNote}
                className={`text-small transition-all duration-150 ease-in-out ${
                  transaction.notes
                    ? "text-primary hover:text-text-primary"
                    : "text-muted hover:text-text-secondary"
                }`}
                aria-label={transaction.notes ? "View/edit note" : "Add note"}
                title={transaction.notes ?? "Add note"}
              >
                {transaction.notes ? "📝" : "+Note"}
              </button>
            )}
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

      {/* Inline note editor row */}
      {noteOpen && (
        <TableRow>
          <TableCell colSpan={7} className="pb-3 pt-1">
            <div className="space-y-2">
              <textarea
                className="stoxly-input w-full resize-none text-small"
                rows={2}
                placeholder="Why did you make this trade? (optional)"
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
              />
              <p className="text-small text-right text-muted">
                {draftNote.length} / 500
              </p>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  className="btn-ghost text-small h-7 px-3"
                  onClick={() => setNoteOpen(false)}
                  disabled={isSavingNote}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary text-small h-7 px-3"
                  onClick={handleSaveNote}
                  disabled={isSavingNote || draftNote.length > 500}
                >
                  {isSavingNote ? "Saving…" : "Save Note"}
                </button>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}

      <EditTransactionDialog
        transaction={transaction}
        portfolioId={portfolioId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}

function TransactionMobileCard({
  transaction,
  portfolioId,
  isSimulation,
}: TransactionRowProps) {
  const { toast } = useToast();
  const { mutate: del, isPending } = useDeleteTransaction(portfolioId);
  const { mutate: saveNote, isPending: isSavingNote } =
    useUpdateTradeNote(portfolioId);
  const [editOpen, setEditOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [draftNote, setDraftNote] = useState("");

  function handleDelete() {
    del(transaction.id, {
      onSuccess: () => toast("Transaction deleted", "success"),
      onError: (err) => toast(err.message || "Failed to delete", "error"),
    });
  }

  function openNote() {
    setDraftNote(transaction.notes ?? "");
    setNoteOpen(true);
  }

  function handleSaveNote() {
    saveNote(
      { id: transaction.id, notes: draftNote.trim() || null },
      {
        onSuccess: () => {
          setNoteOpen(false);
          toast("Note saved", "success");
        },
        onError: (err) => toast(err.message || "Failed to save note", "error"),
      },
    );
  }

  const isBuy = transaction.type === "BUY";

  return (
    <>
      <div className="rounded-xl border border-border p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary">
              {transaction.symbol}
            </span>
            <span
              className={`rounded px-2 py-0.5 text-small font-semibold ${
                isBuy ? "trend-up" : "trend-down"
              }`}
            >
              {transaction.type}
            </span>
          </div>
          <span className="font-semibold text-text-primary">
            ${formatCurrency(transaction.total)}
          </span>
        </div>
        <p className="text-small text-text-secondary mb-1.5">
          {formatDate(transaction.tradeDate)}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-small text-text-secondary">
            {formatQuantity(transaction.quantity)} @ $
            {formatCurrency(transaction.price)}
          </span>
          <div className="flex items-center gap-3">
            {isSimulation && (
              <button
                onClick={openNote}
                className={`text-small transition-all duration-150 ease-in-out ${
                  transaction.notes
                    ? "text-primary hover:text-text-primary"
                    : "text-muted hover:text-text-secondary"
                }`}
                aria-label={transaction.notes ? "View/edit note" : "Add note"}
              >
                {transaction.notes ? "📝" : "+Note"}
              </button>
            )}
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
        </div>

        {/* Inline note editor */}
        {noteOpen && (
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            <textarea
              className="stoxly-input w-full resize-none text-small"
              rows={2}
              placeholder="Why did you make this trade? (optional)"
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
            />
            <p className="text-small text-right text-muted">
              {draftNote.length} / 500
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                className="btn-ghost text-small h-7 px-3"
                onClick={() => setNoteOpen(false)}
                disabled={isSavingNote}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary text-small h-7 px-3"
                onClick={handleSaveNote}
                disabled={isSavingNote || draftNote.length > 500}
              >
                {isSavingNote ? "Saving…" : "Save Note"}
              </button>
            </div>
          </div>
        )}
      </div>
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
  isSimulation?: boolean;
}

export default function TransactionList({
  portfolioId,
  isSimulation,
}: TransactionListProps) {
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
        <>
          {/* ── Mobile list (< md) ── */}
          <div className="md:hidden space-y-2">
            {transactions.map((tx) => (
              <TransactionMobileCard
                key={tx.id}
                transaction={tx}
                portfolioId={portfolioId}
                isSimulation={isSimulation}
              />
            ))}
          </div>

          {/* ── Desktop table (≥ md) ── */}
          <div className="hidden md:block">
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
                    isSimulation={isSimulation}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <AddTransactionDialog
        portfolioId={portfolioId}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
    </div>
  );
}
