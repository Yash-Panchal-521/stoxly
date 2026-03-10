"use client";

import { useEffect, useState } from "react";
import { realtimeService } from "@/services/realtimeService";
import type { PriceUpdate } from "@/types/stock";

export function useLiveStockPrices(symbols: string[]) {
  const [livePrices, setLivePrices] = useState<Record<string, PriceUpdate>>({});
  const trackedSymbolsKey = Array.from(new Set(symbols)).join("|");

  useEffect(() => {
    if (!trackedSymbolsKey) {
      return;
    }

    let isDisposed = false;
    const trackedSymbols = new Set(trackedSymbolsKey.split("|"));

    const handlePriceUpdated = (payload: PriceUpdate) => {
      if (isDisposed || !trackedSymbols.has(payload.symbol)) {
        return;
      }

      setLivePrices((currentPrices) => ({
        ...currentPrices,
        [payload.symbol]: payload,
      }));
    };

    const subscribe = async () => {
      try {
        await realtimeService.on("priceUpdated", handlePriceUpdated);
      } catch {
        // Connection failures fall back to API data.
      }
    };

    subscribe();

    return () => {
      isDisposed = true;
      realtimeService.off("priceUpdated", handlePriceUpdated);
    };
  }, [trackedSymbolsKey]);

  return livePrices;
}
