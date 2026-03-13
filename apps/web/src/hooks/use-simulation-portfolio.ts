"use client";

import { useQuery } from "@tanstack/react-query";
import { getSimulationPortfolio } from "@/services/portfolio-service";

export function useSimulationPortfolio() {
  return useQuery({
    queryKey: ["simulation", "portfolio"],
    queryFn: getSimulationPortfolio,
    staleTime: 30_000,
  });
}
