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

export interface PriceUpdateDto {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  updatedAt: string;
}

export interface StockPrice {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  previousClose: number;
  timestamp: string;
}

export interface ChartPoint {
  date: string;
  price: number;
}

export interface StockChartData {
  symbol: string;
  range: string;
  points: ChartPoint[];
}
