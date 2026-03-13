"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTransaction,
  deleteTransaction,
  getAllTransactions,
  getPortfolioTransactions,
  updateTransaction,
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
    },
  });
}
