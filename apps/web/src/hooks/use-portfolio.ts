"use client";

import { useQuery } from "@tanstack/react-query";
import { getPortfolio } from "@/services/portfolio-service";

export function usePortfolio(id: string) {
  return useQuery({
    queryKey: ["portfolios", id],
    queryFn: () => getPortfolio(id),
    enabled: !!id,
  });
}
