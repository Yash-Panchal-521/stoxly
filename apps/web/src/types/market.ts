export interface SymbolSearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

export interface HistoricalPrice {
  symbol: string;
  date: string;
  price: number;
}
