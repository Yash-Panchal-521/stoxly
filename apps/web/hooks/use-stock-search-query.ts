"use client";

import { useQuery } from "@tanstack/react-query";
import { useDeferredValue } from "react";
import { stockService } from "@/services/stockService";

export function useStockSearchQuery(searchTerm: string) {
  const deferredSearchTerm = useDeferredValue(searchTerm);

  return useQuery({
    queryKey: ["stocks", "search", deferredSearchTerm],
    queryFn: () => stockService.searchStocks(deferredSearchTerm),
    enabled: deferredSearchTerm.trim().length > 0,
  });
}
