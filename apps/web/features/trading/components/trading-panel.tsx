"use client";

import { Search, TrendingUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStockSearchQuery } from "@/hooks/use-stock-search-query";

export function TradingPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, error, isFetching } = useStockSearchQuery(searchTerm);

  const hasSearchTerm = searchTerm.trim().length > 0;
  const searchResults = data ?? [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Trading workspace</CardTitle>
        <CardDescription>
          Search requests flow through the stock service layer. Trade execution
          can be added on top of the same pattern.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="stock-search"
          >
            Search stocks
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="stock-search"
              className="pl-11"
              placeholder="Try AAPL, NVDA, or TSLA"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="rounded-[24px] bg-surface-muted p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
                Service boundary
              </p>
              <p className="mt-2 text-sm leading-7 text-muted">
                Components stay declarative. All HTTP work is delegated to typed
                services, then consumed through React Query hooks.
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary">
              <TrendingUpDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm">Buy</Button>
            <Button size="sm" variant="ghost">
              Sell
            </Button>
            <Button size="sm" variant="subtle">
              View order form
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Search results</span>
            {isFetching ? <span>Searching...</span> : null}
          </div>

          {hasSearchTerm ? null : (
            <div className="rounded-[24px] border border-dashed border-border px-4 py-6 text-sm text-muted">
              Start typing to search the documented `/api/stocks/search`
              endpoint.
            </div>
          )}

          {error instanceof Error ? (
            <div className="rounded-[24px] border border-danger/20 bg-danger/5 px-4 py-6 text-sm text-danger">
              {error.message}
            </div>
          ) : null}

          {hasSearchTerm && !error ? (
            <div className="space-y-3">
              {searchResults.length === 0 && !isFetching ? (
                <div className="rounded-[24px] border border-dashed border-border px-4 py-6 text-sm text-muted">
                  No symbols matched that query.
                </div>
              ) : null}

              {searchResults.map((result) => (
                <div
                  key={result.symbol}
                  className="flex items-center justify-between rounded-[24px] border border-border bg-white/70 px-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {result.symbol}
                    </p>
                    <p className="text-sm text-muted">{result.companyName}</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    Add to order ticket
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
