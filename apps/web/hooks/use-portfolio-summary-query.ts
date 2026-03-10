"use client";

import { useQuery } from "@tanstack/react-query";
import { portfolioService } from "@/services/portfolioService";

export function usePortfolioSummaryQuery() {
  return useQuery({
    queryKey: ["portfolio", "summary"],
    queryFn: () => portfolioService.getSummary(),
  });
}
