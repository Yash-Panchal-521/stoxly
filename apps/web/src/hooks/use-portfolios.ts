"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserPortfolios } from "@/services/portfolio-service";

export function usePortfolios() {
  return useQuery({
    queryKey: ["portfolios"],
    queryFn: getUserPortfolios,
  });
}
