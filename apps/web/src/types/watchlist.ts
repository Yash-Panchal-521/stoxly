export interface WatchlistItem {
  symbol: string;
  companyName: string | null;
  exchange: string | null;
  currentPrice: number | null;
  change: number | null;
  changePercent: number | null;
}

export interface AddWatchlistItemRequest {
  symbol: string;
}
