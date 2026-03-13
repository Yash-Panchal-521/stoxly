import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type {
  CreateTransactionRequest,
  SimulationBuyRequest,
  SimulationSellRequest,
  SimulationTradeResponse,
  TransactionResponse,
  UpdateTransactionRequest,
} from "@/types/transaction";

export async function createTransaction(
  portfolioId: string,
  data: CreateTransactionRequest,
): Promise<TransactionResponse> {
  return apiPost<TransactionResponse>(
    `/portfolios/${portfolioId}/transactions`,
    data,
  );
}

export async function getPortfolioTransactions(
  portfolioId: string,
): Promise<TransactionResponse[]> {
  return apiGet<TransactionResponse[]>(
    `/portfolios/${portfolioId}/transactions`,
  );
}

export async function getAllTransactions(): Promise<TransactionResponse[]> {
  return apiGet<TransactionResponse[]>(`/transactions`);
}

export async function updateTransaction(
  id: string,
  data: UpdateTransactionRequest,
): Promise<TransactionResponse> {
  return apiPatch<TransactionResponse>(`/transactions/${id}`, data);
}

export async function deleteTransaction(
  id: string,
  portfolioId: string,
): Promise<void> {
  return apiDelete(`/transactions/${id}?portfolioId=${portfolioId}`);
}

export async function simulationBuy(
  data: SimulationBuyRequest,
): Promise<SimulationTradeResponse> {
  return apiPost<SimulationTradeResponse>("/simulation/buy", data);
}

export async function simulationSell(
  data: SimulationSellRequest,
): Promise<SimulationTradeResponse> {
  return apiPost<SimulationTradeResponse>("/simulation/sell", data);
}

export async function updateTradeNote(
  transactionId: string,
  notes: string | null,
): Promise<void> {
  return apiPatch<void>(`/simulation/trades/${transactionId}/notes`, { notes });
}
