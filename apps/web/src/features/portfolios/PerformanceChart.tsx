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
import type { PerformanceDataPoint } from "@/types/portfolio";
import { usePerformance } from "@/hooks/use-performance";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

type Range = "1M" | "3M" | "6M" | "1Y" | "ALL";
const RANGES: Range[] = ["1M", "3M", "6M", "1Y", "ALL"];

function filterByRange(
  data: PerformanceDataPoint[],
  range: Range,
): PerformanceDataPoint[] {
  if (range === "ALL" || data.length === 0) return data;
  const months: Record<Range, number> = {
    "1M": 1,
    "3M": 3,
    "6M": 6,
    "1Y": 12,
    ALL: 0,
  };
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months[range]);
  return data.filter((d) => new Date(d.date) >= cutoff);
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PerformanceDataPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
      <p className="text-small font-semibold text-text-primary">
        {formatCurrency(point.value)}
      </p>
      <p className="text-small text-text-secondary">{formatDate(point.date)}</p>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="stoxly-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-36 animate-pulse rounded bg-surface" />
        <div className="h-5 w-24 animate-pulse rounded bg-surface" />
      </div>
      <div className="h-56 animate-pulse rounded-xl bg-surface" />
    </div>
  );
}

interface PerformanceChartProps {
  readonly portfolioId: string;
}

export default function PerformanceChart({
  portfolioId,
}: PerformanceChartProps) {
  const { data, isLoading, isError } = usePerformance(portfolioId);
  const [range, setRange] = useState<Range>("ALL");

  if (isLoading) return <ChartSkeleton />;

  if (isError) {
    return (
      <div className="stoxly-card flex flex-col items-center justify-center py-12 text-center">
        <p className="text-body text-danger">
          Failed to load performance data.
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="stoxly-card flex flex-col items-center justify-center py-12 text-center">
        <p className="text-body text-muted">No performance data yet.</p>
        <p className="text-small text-muted mt-1">
          Add transactions to start tracking portfolio value.
        </p>
      </div>
    );
  }

  const filtered = filterByRange(data, range);
  const firstValue = filtered[0]?.value ?? 0;
  const lastValue = filtered.at(-1)?.value ?? 0;
  const change = lastValue - firstValue;
  const changePct = firstValue === 0 ? 0 : (change / firstValue) * 100;
  const isPositive = change >= 0;

  const lineColor = isPositive ? "rgb(48,209,88)" : "rgb(255,69,58)";
  const gradientColor = isPositive
    ? "rgba(48,209,88,0.25)"
    : "rgba(255,69,58,0.25)";

  const chartData = filtered.map((d) => ({
    ...d,
    label: formatDateShort(d.date),
  }));

  return (
    <div className="stoxly-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-h3">Performance</h2>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[16px] font-semibold leading-snug text-text-primary">
              {formatCurrency(lastValue)}
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
            <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
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
            tickFormatter={formatCurrency}
            tick={{ fill: "rgb(134,134,139)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={58}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            fill="url(#perfGrad)"
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
