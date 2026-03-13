"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} from "@/services/watchlist-service";
import type { AddWatchlistItemRequest } from "@/types/watchlist";

export function useWatchlist() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: getWatchlist,
    staleTime: 30_000,
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddWatchlistItemRequest) => addToWatchlist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (symbol: string) => removeFromWatchlist(symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}
