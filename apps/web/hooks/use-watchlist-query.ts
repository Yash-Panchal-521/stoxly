"use client";

import { useQuery } from "@tanstack/react-query";
import { stockService } from "@/services/stockService";

export function useWatchlistQuery() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: () => stockService.getWatchlist(),
  });
}
