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
