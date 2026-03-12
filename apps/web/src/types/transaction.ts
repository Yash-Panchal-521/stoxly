export type TransactionType = "BUY" | "SELL";

export interface TransactionResponse {
  id: string;
  portfolioId: string;
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
