export type PortfolioType = "SIMULATION" | "TRACKING";

export interface PortfolioResponse {
  id: string;
  name: string;
  description: string | null;
  baseCurrency: string;
  portfolioType: PortfolioType;
  startingCash: number | null;
  cashBalance: number | null;
  createdAt: string;
}

export interface CreatePortfolioRequest {
  name: string;
  description?: string;
  baseCurrency?: string;
}

export interface CreateSimulationPortfolioRequest {
  name: string;
  description?: string;
  startingCash: number;
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

export interface SimulationPortfolioResponse {
  id: string;
  name: string;
  startingCash: number;
  cashBalance: number;
  cashUsed: number;
  cashUsedPercent: number;
  portfolioType: PortfolioType;
  createdAt: string;
}
