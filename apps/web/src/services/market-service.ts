import { apiGet } from "@/lib/api-client";
import type { HistoricalPrice, SymbolSearchResult } from "@/types/market";

export async function searchSymbols(
  query: string,
): Promise<SymbolSearchResult[]> {
  return apiGet<SymbolSearchResult[]>(
    `/market/search?q=${encodeURIComponent(query)}`,
  );
}

export async function getHistoricalPrice(
  symbol: string,
  date: string,
): Promise<HistoricalPrice | null> {
  return apiGet<HistoricalPrice>(
    `/market/historical-price?symbol=${encodeURIComponent(symbol)}&date=${encodeURIComponent(date)}`,
  ).catch(() => null);
}
