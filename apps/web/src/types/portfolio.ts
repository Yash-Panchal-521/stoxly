export interface PortfolioResponse {
  id: string;
  name: string;
  description: string | null;
  baseCurrency: string;
  createdAt: string;
}

export interface CreatePortfolioRequest {
  name: string;
  description?: string;
  baseCurrency?: string;
}

export interface UpdatePortfolioRequest {
  name: string;
  description?: string;
}

export interface HoldingDto {
  symbol: string;
  quantity: number;
  averagePrice: number;
  invested: number;
  realizedProfit: number;
  currentPrice: number | null;
  unrealizedProfit: number | null;
}

export interface PortfolioMetricsDto {
  portfolioValue: number;
  totalInvested: number;
  realizedProfit: number;
  unrealizedProfit: number;
  totalProfit: number;
}

export interface PerformanceDataPoint {
  date: string;
  value: number;
}
