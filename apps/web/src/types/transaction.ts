export type TransactionType = "BUY" | "SELL";

export interface TransactionResponse {
  id: string;
  portfolioId: string;
  portfolioName: string | null;
  symbol: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fee: number;
  total: number;
  tradeDate: string;
  notes: string | null;
  createdAt: string;
}

export interface CreateTransactionRequest {
  symbol: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fee?: number;
  tradeDate: string;
  notes?: string;
}

export interface UpdateTransactionRequest {
  portfolioId: string;
  fee?: number;
  notes?: string | null;
}

// Simulation trading

export interface SimulationBuyRequest {
  portfolioId: string;
  symbol: string;
  quantity: number;
  notes?: string;
}

export interface SimulationSellRequest {
  portfolioId: string;
  symbol: string;
  quantity: number;
  notes?: string;
}

export interface SimulationTradeResponse {
  transactionId: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  total: number;
  fee: number;
  executedAt: string;
  remainingCashBalance: number;
  notes: string | null;
}
