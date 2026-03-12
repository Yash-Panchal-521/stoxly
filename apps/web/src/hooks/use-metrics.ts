"use client";

import { useQuery } from "@tanstack/react-query";
import { getMetrics } from "@/services/portfolio-service";

export function useMetrics(portfolioId: string) {
  return useQuery({
    queryKey: ["portfolios", portfolioId, "metrics"],
    queryFn: () => getMetrics(portfolioId),
    enabled: !!portfolioId,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
