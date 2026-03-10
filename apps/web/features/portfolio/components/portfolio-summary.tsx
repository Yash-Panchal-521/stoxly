"use client";

import { ArrowRight, TrendingUp, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QueryState } from "@/components/ui/query-state";
import { useDashboardView } from "@/hooks/use-dashboard-view";
import { useLiveStockPrices } from "@/hooks/use-live-stock-prices";
import { usePortfolioSummaryQuery } from "@/hooks/use-portfolio-summary-query";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const percentageFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function PortfolioSummary() {
  const activeView = useDashboardView((state) => state.activeView);
  const { data, error, isLoading } = usePortfolioSummaryQuery();

  const holdings = data?.holdings ?? [];
  const livePrices = useLiveStockPrices(
    holdings.map((holding) => holding.stockSymbol),
  );

  const enrichedHoldings = holdings.map((holding) => {
    const livePrice =
      livePrices[holding.stockSymbol]?.price ??
      holding.marketPrice ??
      holding.averagePrice;

    return {
      ...holding,
      livePrice,
      positionValue: holding.quantity * livePrice,
    };
  });

  const totalCostBasis = enrichedHoldings.reduce(
    (sum, holding) => sum + holding.quantity * holding.averagePrice,
    0,
  );

  const totalMarketValue = enrichedHoldings.reduce(
    (sum, holding) => sum + holding.positionValue,
    0,
  );

  const totalReturn = totalMarketValue - totalCostBasis;
  const totalReturnPercentage =
    totalCostBasis > 0 ? (totalReturn / totalCostBasis) * 100 : 0;

  const visibleHoldings =
    activeView === "focus" ? enrichedHoldings.slice(0, 3) : enrichedHoldings;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>Portfolio summary</CardTitle>
          <CardDescription>
            React Query fetches server data while SignalR streams live prices
            into the same screen.
          </CardDescription>
        </div>
        <div className="rounded-full bg-surface-muted px-4 py-2 text-sm text-muted">
          {data?.portfolio?.name ?? "Waiting for portfolio data"}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryMetric
            label="Market value"
            value={currencyFormatter.format(totalMarketValue)}
            icon={Wallet}
          />
          <SummaryMetric
            label="Cost basis"
            value={currencyFormatter.format(totalCostBasis)}
            icon={ArrowRight}
          />
          <SummaryMetric
            label="Unrealized return"
            value={`${currencyFormatter.format(totalReturn)} (${percentageFormatter.format(totalReturnPercentage)}%)`}
            icon={TrendingUp}
            tone={totalReturn >= 0 ? "positive" : "negative"}
          />
        </div>

        <QueryState
          error={error instanceof Error ? error : null}
          emptyMessage="Create a portfolio in the backend to populate this module."
          hasData={Boolean(data?.portfolio)}
          isLoading={isLoading}
          loadingMessage="Loading portfolio summary..."
        >
          <div className="overflow-hidden rounded-[24px] border border-border">
            <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] gap-3 bg-surface-muted px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              <span>Holding</span>
              <span>Quantity</span>
              <span>Price</span>
              <span>Position</span>
            </div>
            <div className="divide-y divide-border bg-surface-strong/75">
              {visibleHoldings.map((holding) => (
                <div
                  key={holding.stockSymbol}
                  className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] gap-3 px-4 py-4 text-sm"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {holding.stockSymbol}
                    </p>
                    <p className="text-muted">
                      Average {priceFormatter.format(holding.averagePrice)}
                    </p>
                  </div>
                  <span>{holding.quantity}</span>
                  <span>{priceFormatter.format(holding.livePrice)}</span>
                  <span className="font-medium text-foreground">
                    {currencyFormatter.format(holding.positionValue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </QueryState>
      </CardContent>
    </Card>
  );
}

type SummaryMetricProps = Readonly<{
  icon: typeof Wallet;
  label: string;
  tone?: "default" | "positive" | "negative";
  value: string;
}>;

function SummaryMetric({
  icon: Icon,
  label,
  tone = "default",
  value,
}: Readonly<SummaryMetricProps>) {
  return (
    <div className="rounded-[24px] border border-border bg-surface-strong p-5 shadow-[0_0_28px_rgba(34,211,238,0.05)]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm text-muted">{label}</p>
      <p
        className={[
          "mt-2 text-xl font-semibold tracking-tight",
          tone === "positive" ? "text-success" : "",
          tone === "negative" ? "text-danger" : "",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
