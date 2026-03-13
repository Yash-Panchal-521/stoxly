import { apiGet } from "@/lib/api-client";
import type {
  HistoricalPrice,
  StockChartData,
  StockPrice,
  SymbolSearchResult,
} from "@/types/market";

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

export async function getStockPrice(symbol: string): Promise<StockPrice> {
  return apiGet<StockPrice>(`/market/price/${encodeURIComponent(symbol)}`);
}

export async function getStockChart(
  symbol: string,
  range: string,
): Promise<StockChartData> {
  return apiGet<StockChartData>(
    `/market/chart/${encodeURIComponent(symbol)}?range=${encodeURIComponent(range)}`,
  );
}
