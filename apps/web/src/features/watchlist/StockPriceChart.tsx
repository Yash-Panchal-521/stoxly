"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStockChart } from "@/hooks/use-stock-detail";
import type { ChartPoint } from "@/types/market";

function formatCurrency(v: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateFull(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Range = "1W" | "1M" | "3M" | "6M" | "1Y";
const RANGES: Range[] = ["1W", "1M", "3M", "6M", "1Y"];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
      <p className="text-small font-semibold text-text-primary">
        {formatCurrency(point.price)}
      </p>
      <p className="text-small text-text-secondary">
        {formatDateFull(point.date)}
      </p>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="stoxly-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 animate-pulse rounded bg-surface" />
        <div className="h-5 w-24 animate-pulse rounded bg-surface" />
      </div>
      <div className="h-52 animate-pulse rounded-xl bg-surface" />
    </div>
  );
}

interface StockPriceChartProps {
  readonly symbol: string;
}

export default function StockPriceChart({ symbol }: StockPriceChartProps) {
  const [range, setRange] = useState<Range>("1M");
  const { data, isLoading, isError } = useStockChart(symbol, range);

  if (isLoading) return <ChartSkeleton />;

  if (isError) {
    return (
      <div className="stoxly-card flex flex-col items-center justify-center py-12 text-center">
        <p className="text-body text-danger">Failed to load chart data.</p>
      </div>
    );
  }

  const points: ChartPoint[] = data?.points ?? [];

  if (points.length === 0) {
    return (
      <div className="stoxly-card flex flex-col items-center justify-center py-12 text-center">
        <p className="text-body text-muted">No chart data available.</p>
      </div>
    );
  }

  const firstPrice = points[0].price;
  const lastPrice = points.at(-1)!.price;
  const change = lastPrice - firstPrice;
  const changePct = firstPrice === 0 ? 0 : (change / firstPrice) * 100;
  const isPositive = change >= 0;

  const lineColor = isPositive ? "rgb(48,209,88)" : "rgb(255,69,58)";
  const gradientColor = isPositive
    ? "rgba(48,209,88,0.25)"
    : "rgba(255,69,58,0.25)";

  const chartData = points.map((p) => ({
    ...p,
    label: formatDateShort(p.date),
  }));

  return (
    <div className="stoxly-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-h3">Price Chart</h2>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[16px] font-semibold leading-snug text-text-primary">
              {formatCurrency(lastPrice)}
            </span>
            <span
              className={`text-small font-medium ${isPositive ? "text-success" : "text-danger"}`}
            >
              {isPositive ? "+" : ""}
              {formatCurrency(change)} ({changePct.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1 text-small font-medium transition-all duration-150 ease-in-out ${
                range === r
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 4, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientColor} stopOpacity={1} />
              <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "rgb(134,134,139)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
            tick={{ fill: "rgb(134,134,139)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={62}
            domain={["auto", "auto"]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={2}
            fill="url(#stockGrad)"
            dot={false}
            activeDot={{
              r: 4,
              fill: lineColor,
              stroke: "rgba(0,0,0,0.6)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
