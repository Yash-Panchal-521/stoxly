import { apiClient } from "@/services/apiClient";
import type { StockSearchResult, WatchlistStock } from "@/types/stock";

async function getWatchlist() {
  return apiClient<WatchlistStock[]>("/watchlist");
}

async function searchStocks(query: string) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [] satisfies StockSearchResult[];
  }

  return apiClient<StockSearchResult[]>(
    `/stocks/search?q=${encodeURIComponent(trimmedQuery)}`,
  );
}

export const stockService = {
  getWatchlist,
  searchStocks,
};
