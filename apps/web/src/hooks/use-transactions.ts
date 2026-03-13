"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTransaction,
  deleteTransaction,
  getAllTransactions,
  getPortfolioTransactions,
  updateTransaction,
  updateTradeNote,
} from "@/services/transaction-service";
import type {
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from "@/types/transaction";

export function useTransactions(portfolioId: string) {
  return useQuery({
    queryKey: ["transactions", portfolioId],
    queryFn: () => getPortfolioTransactions(portfolioId),
    enabled: !!portfolioId,
  });
}

export function useAllTransactions() {
  return useQuery({
    queryKey: ["transactions", "all"],
    queryFn: getAllTransactions,
  });
}

export function useCreateTransaction(portfolioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransactionRequest) =>
      createTransaction(portfolioId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", portfolioId],
      });
      queryClient.invalidateQueries({
        queryKey: ["portfolios", portfolioId, "holdings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["portfolios", portfolioId, "metrics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["portfolios", portfolioId, "performance"],
      });
      queryClient.invalidateQueries({
        queryKey: ["simulation", "portfolio"],
      });
    },
  });
}

export function useUpdateTransaction(portfolioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTransactionRequest;
    }) => updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", portfolioId],
      });
      queryClient.invalidateQueries({
        queryKey: ["portfolios", portfolioId, "holdings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["portfolios", portfolioId, "metrics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["portfolios", portfolioId, "performance"],
      });
      queryClient.invalidateQueries({
        queryKey: ["simulation", "portfolio"],
      });
    },
  });
}

export function useDeleteTransaction(portfolioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transactionId: string) =>
      deleteTransaction(transactionId, portfolioId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", portfolioId],
      });
      queryClient.invalidateQueries({
        queryKey: ["portfolios", portfolioId, "holdings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["portfolios", portfolioId, "metrics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["portfolios", portfolioId, "performance"],
      });
      queryClient.invalidateQueries({
        queryKey: ["simulation", "portfolio"],
      });
    },
  });
}

export function useUpdateTradeNote(portfolioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string | null }) =>
      updateTradeNote(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", portfolioId],
      });
    },
  });
}
