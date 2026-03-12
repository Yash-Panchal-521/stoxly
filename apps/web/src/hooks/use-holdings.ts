"use client";

import { useQuery } from "@tanstack/react-query";
import { getHoldings } from "@/services/portfolio-service";

export function useHoldings(portfolioId: string) {
  return useQuery({
    queryKey: ["portfolios", portfolioId, "holdings"],
    queryFn: () => getHoldings(portfolioId),
    enabled: !!portfolioId,
  });
}
