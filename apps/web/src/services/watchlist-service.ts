import { apiDelete, apiGet, apiPost } from "@/lib/api-client";
import type { AddWatchlistItemRequest, WatchlistItem } from "@/types/watchlist";

const BASE_PATH = "/watchlist";

export async function getWatchlist(): Promise<WatchlistItem[]> {
  return apiGet<WatchlistItem[]>(BASE_PATH);
}

export async function addToWatchlist(
  data: AddWatchlistItemRequest,
): Promise<WatchlistItem> {
  return apiPost<WatchlistItem>(BASE_PATH, data);
}

export async function removeFromWatchlist(symbol: string): Promise<void> {
  return apiDelete(`${BASE_PATH}/${encodeURIComponent(symbol)}`);
}
