"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { HoldingDto } from "@/types/portfolio";

const PALETTE = [
  "#0A84FF",
  "#30D158",
  "#FF9F0A",
  "#FF453A",
  "#BF5AF2",
  "#5AC8FA",
  "#FF6369",
  "#FFD60A",
  "#32ADE6",
  "#FF375F",
];

interface SliceData {
  symbol: string;
  value: number;
  pct: number;
  color: string;
}

function formatCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(v);
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: SliceData }>;
}) {
  if (!active || !payload?.length) return null;
  const s = payload[0]!.payload;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
      <p className="text-small font-semibold text-text-primary">{s.symbol}</p>
      <p className="text-small text-text-secondary">
        {formatCurrency(s.value)} &middot; {s.pct.toFixed(1)}%
      </p>
    </div>
  );
}

interface AllocationChartProps {
  holdings: HoldingDto[];
  priceOverrides?: Record<string, { price: number }>;
}

export default function AllocationChart({
  holdings,
  priceOverrides,
}: AllocationChartProps) {
  const slices = useMemo<SliceData[]>(() => {
    const raw = holdings
      .map((h) => {
        const price =
          priceOverrides?.[h.symbol]?.price ?? h.currentPrice ?? h.averagePrice;
        return { symbol: h.symbol, value: price * h.quantity };
      })
      .filter((s) => s.value > 0);

    const total = raw.reduce((sum, s) => sum + s.value, 0);
    if (total === 0) return [];

    return raw.map((s, i) => ({
      ...s,
      pct: (s.value / total) * 100,
      color: PALETTE[i % PALETTE.length],
    }));
  }, [holdings, priceOverrides]);

  if (slices.length === 0) {
    return (
      <div className="stoxly-card flex items-center justify-center py-12">
        <p className="text-body text-muted">No holdings to display.</p>
      </div>
    );
  }

  return (
    <div className="stoxly-card space-y-4">
      <h2 className="text-h3">Asset Allocation</h2>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Donut */}
        <div className="w-full max-w-[200px] shrink-0">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={slices}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {slices.map((s) => (
                  <Cell key={s.symbol} fill={s.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex w-full flex-col gap-2">
          {slices.map((s) => (
            <div
              key={s.symbol}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-small font-medium text-text-primary truncate">
                  {s.symbol}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-small text-text-secondary">
                  {formatCurrency(s.value)}
                </span>
                <span
                  className="w-12 text-right text-small font-semibold"
                  style={{ color: s.color }}
                >
                  {s.pct.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
