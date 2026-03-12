"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTransaction,
  deleteTransaction,
  getPortfolioTransactions,
} from "@/services/transaction-service";
import type { CreateTransactionRequest } from "@/types/transaction";

export function useTransactions(portfolioId: string) {
  return useQuery({
    queryKey: ["transactions", portfolioId],
    queryFn: () => getPortfolioTransactions(portfolioId),
    enabled: !!portfolioId,
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
