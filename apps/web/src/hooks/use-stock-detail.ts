"use client";

import { useQuery } from "@tanstack/react-query";
import { getStockChart, getStockPrice } from "@/services/market-service";

export function useStockPrice(symbol: string) {
  return useQuery({
    queryKey: ["market", "price", symbol],
    queryFn: () => getStockPrice(symbol),
    staleTime: 30_000,
    refetchInterval: 60_000,
    enabled: Boolean(symbol),
  });
}

export function useStockChart(symbol: string, range: string) {
  return useQuery({
    queryKey: ["market", "chart", symbol, range],
    queryFn: () => getStockChart(symbol, range),
    staleTime: 5 * 60_000,
    enabled: Boolean(symbol),
  });
}
