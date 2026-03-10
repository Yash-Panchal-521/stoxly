export interface StockSearchResult {
  symbol: string;
  companyName: string;
}

export interface WatchlistStock extends StockSearchResult {
  latestPrice?: number;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: string;
}

export interface PortfolioUpdatedEvent {
  portfolioId: string;
  newValue: number;
}
