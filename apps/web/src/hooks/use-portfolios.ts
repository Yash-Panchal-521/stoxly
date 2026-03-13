"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserPortfolios,
  updatePortfolio,
} from "@/services/portfolio-service";
import type { UpdatePortfolioRequest } from "@/types/portfolio";

export function usePortfolios() {
  return useQuery({
    queryKey: ["portfolios"],
    queryFn: getUserPortfolios,
  });
}

export function useUpdatePortfolio(portfolioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePortfolioRequest) =>
      updatePortfolio(portfolioId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
    },
  });
}
