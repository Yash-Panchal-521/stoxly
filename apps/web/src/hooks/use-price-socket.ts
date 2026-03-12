"use client";

import { useEffect, useRef, useState } from "react";
import type { HubConnection } from "@microsoft/signalr";
import { createPriceHubConnection } from "@/lib/signalr";
import type { PriceUpdateDto } from "@/types/market";

export function usePriceSocket(symbols: string[]) {
  const connectionRef = useRef<HubConnection | null>(null);
  const [prices, setPrices] = useState<Record<string, PriceUpdateDto>>({});

  // Stable string key — avoids re-connecting on same symbols with new array reference
  const symbolsKey = [...symbols].sort((a, b) => a.localeCompare(b)).join(",");

  useEffect(() => {
    if (!symbolsKey) return;

    const symbolList = symbolsKey.split(",").filter(Boolean);
    const connection = createPriceHubConnection();
    connectionRef.current = connection;
    let active = true;

    connection.on("PriceUpdated", (update: PriceUpdateDto) => {
      if (!active) return;
      setPrices((prev) => ({ ...prev, [update.symbol]: update }));
    });

    async function startAndSubscribe() {
      await connection.start();
      if (!active) return;
      for (const symbol of symbolList) {
        connection.invoke("SubscribeToSymbol", symbol).catch(() => {});
      }
    }

    startAndSubscribe().catch(() => {
      // SignalR unavailable — REST data continues to work normally.
    });

    return () => {
      active = false;
      connectionRef.current = null;
      connection.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey]);

  return prices;
}
