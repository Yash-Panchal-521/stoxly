"use client";

import { useQuery } from "@tanstack/react-query";
import { getPerformance } from "@/services/portfolio-service";

export function usePerformance(portfolioId: string) {
  return useQuery({
    queryKey: ["portfolios", portfolioId, "performance"],
    queryFn: () => getPerformance(portfolioId),
    enabled: !!portfolioId,
    // Performance data changes at most once a day; 5-min stale time is plenty.
    staleTime: 5 * 60 * 1000,
  });
}
