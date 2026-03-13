"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { simulationBuy, simulationSell } from "@/services/transaction-service";
import type {
  SimulationBuyRequest,
  SimulationSellRequest,
} from "@/types/transaction";

export function useSimulationBuy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SimulationBuyRequest) => simulationBuy(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["simulation", "portfolio"] });
      queryClient.invalidateQueries({
        queryKey: ["portfolios", variables.portfolioId, "holdings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["transactions", variables.portfolioId],
      });
    },
  });
}

export function useSimulationSell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SimulationSellRequest) => simulationSell(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["simulation", "portfolio"] });
      queryClient.invalidateQueries({
        queryKey: ["portfolios", variables.portfolioId, "holdings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["transactions", variables.portfolioId],
      });
    },
  });
}
