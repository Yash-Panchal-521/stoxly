export interface Portfolio {
  id: string;
  name: string;
  createdAt: string;
}

export interface Holding {
  stockSymbol: string;
  quantity: number;
  averagePrice: number;
  companyName?: string;
  marketPrice?: number;
}

export interface PortfolioDetails extends Portfolio {
  holdings: Holding[];
}

export interface PortfolioSummary {
  portfolio: Portfolio | null;
  holdings: Holding[];
  totalCostBasis: number;
  totalMarketValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
}
