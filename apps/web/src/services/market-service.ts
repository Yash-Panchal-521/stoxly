import { apiGet } from "@/lib/api-client";
import type { SymbolSearchResult } from "@/types/market";

export async function searchSymbols(
  query: string,
): Promise<SymbolSearchResult[]> {
  return apiGet<SymbolSearchResult[]>(
    `/market/search?q=${encodeURIComponent(query)}`,
  );
}
