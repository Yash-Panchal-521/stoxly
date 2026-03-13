"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useStockChart } from "@/hooks/use-stock-detail";
import type { ChartPoint } from "@/types/market";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// Cardinal spline — mirrors PerformanceChart pattern
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const tension = 0.4;
  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Range = "1W" | "1M" | "3M" | "6M" | "1Y";
const RANGES: Range[] = ["1W", "1M", "3M", "6M", "1Y"];

interface TooltipState {
  x: number;
  y: number;
  point: ChartPoint;
}

const PADDING = { top: 16, right: 12, bottom: 32, left: 60 };
const SVG_HEIGHT = 220;
const SVG_WIDTH = 800;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="stoxly-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-28 animate-pulse rounded bg-surface" />
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <div
              key={r}
              className="h-7 w-10 animate-pulse rounded-lg bg-surface"
            />
          ))}
        </div>
      </div>
      <div className="h-56 animate-pulse rounded-xl bg-surface" />
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface StockPriceChartProps {
  readonly symbol: string;
}

export default function StockPriceChart({ symbol }: StockPriceChartProps) {
  const [range, setRange] = useState<Range>("1M");
  const { data, isLoading, isError } = useStockChart(symbol, range);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientId = useId().replaceAll(":", "");

  const points = data?.points ?? [];

  const computeSvgPoints = useCallback((chartPoints: ChartPoint[]) => {
    if (chartPoints.length === 0) return { svgPts: [], minVal: 0, maxVal: 0 };

    const values = chartPoints.map((p) => p.price);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const valRange = maxVal - minVal || 1;

    const innerW = SVG_WIDTH - PADDING.left - PADDING.right;
    const innerH = SVG_HEIGHT - PADDING.top - PADDING.bottom;

    const svgPts = chartPoints.map((p, i) => ({
      x: PADDING.left + (i / (chartPoints.length - 1 || 1)) * innerW,
      y: PADDING.top + innerH - ((p.price - minVal) / valRange) * innerH,
    }));

    return { svgPts, minVal, maxVal };
  }, []);

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current || svgPts.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = SVG_WIDTH / rect.width;
    const svgX = (e.clientX - rect.left) * scaleX;

    let nearest = 0;
    let minDist = Infinity;
    svgPts.forEach((p, i) => {
      const d = Math.abs(p.x - svgX);
      if (d < minDist) {
        minDist = d;
        nearest = i;
      }
    });

    setTooltip({
      x: svgPts[nearest].x,
      y: svgPts[nearest].y,
      point: points[nearest],
    });
  }

  if (isLoading) return <ChartSkeleton />;

  if (isError) {
    return (
      <div className="stoxly-card flex items-center justify-center py-12">
        <p className="text-body text-danger">Failed to load chart data.</p>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="stoxly-card flex flex-col items-center justify-center py-12 text-center">
        <p className="text-body text-muted">
          No chart data available for this range.
        </p>
      </div>
    );
  }

  const firstPrice = points[0].price;
  const lastPrice = points.at(-1)!.price;
  const priceChange = lastPrice - firstPrice;
  const pricePct = firstPrice === 0 ? 0 : (priceChange / firstPrice) * 100;
  const isPositive = priceChange >= 0;

  const { svgPts, minVal, maxVal } = computeSvgPoints(points);
  const innerH = SVG_HEIGHT - PADDING.top - PADDING.bottom;
  const innerW = SVG_WIDTH - PADDING.left - PADDING.right;

  const linePath = buildSmoothPath(svgPts);
  const areaPath =
    svgPts.length > 0
      ? `${linePath} L ${(svgPts.at(-1) ?? svgPts[0]).x} ${PADDING.top + innerH} L ${svgPts[0].x} ${PADDING.top + innerH} Z`
      : "";

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    value: minVal + t * (maxVal - minVal),
    y: PADDING.top + innerH - t * innerH,
  }));

  const xLabelCount = Math.min(5, points.length);
  const xLabels =
    points.length > 0
      ? Array.from({ length: xLabelCount }, (_, i) => {
          const idx = Math.round(
            (i / (xLabelCount - 1 || 1)) * (points.length - 1),
          );
          return {
            label: formatDateShort(points[idx].date),
            x: PADDING.left + (idx / (points.length - 1 || 1)) * innerW,
          };
        })
      : [];

  const lineColor = isPositive ? "rgb(48,209,88)" : "rgb(255,69,58)";
  const gradientStart = isPositive
    ? "rgba(48,209,88,0.2)"
    : "rgba(255,69,58,0.2)";

  return (
    <div className="stoxly-card space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-h3">Price History</h2>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-h2 font-semibold text-text-primary">
              {formatCurrency(lastPrice)}
            </span>
            <span
              className={`text-small font-medium ${isPositive ? "text-success" : "text-danger"}`}
            >
              {isPositive ? "+" : ""}
              {formatCurrency(priceChange)} ({isPositive ? "+" : ""}
              {pricePct.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Range selector */}
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

      {/* SVG Chart */}
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
          aria-label={`${symbol} price chart — ${range}`}
        >
          <defs>
            <linearGradient id={`sg-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientStart} />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
          </defs>

          {/* Y-axis grid + labels */}
          {yTicks.map(({ value, y }) => (
            <g key={y}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={SVG_WIDTH - PADDING.right}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 6}
                y={y + 4}
                fill="rgba(134,134,139,0.9)"
                fontSize={10}
                textAnchor="end"
              >
                {formatCurrency(value)}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {xLabels.map(({ label, x }) => (
            <text
              key={label}
              x={x}
              y={SVG_HEIGHT - 6}
              fill="rgba(134,134,139,0.9)"
              fontSize={10}
              textAnchor="middle"
            >
              {label}
            </text>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill={`url(#sg-${gradientId})`} />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Tooltip crosshair */}
          {tooltip && (
            <>
              <line
                x1={tooltip.x}
                y1={PADDING.top}
                x2={tooltip.x}
                y2={PADDING.top + innerH}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
                strokeDasharray="4 2"
              />
              <circle
                cx={tooltip.x}
                cy={tooltip.y}
                r={4}
                fill={lineColor}
                stroke="rgba(0,0,0,0.6)"
                strokeWidth={2}
              />
            </>
          )}
        </svg>

        {/* Tooltip card */}
        {tooltip && (
          <div
            className="pointer-events-none absolute rounded-xl border border-border bg-card px-3 py-2 shadow-sm"
            style={{
              left: `${(tooltip.x / SVG_WIDTH) * 100}%`,
              top: `${(tooltip.y / SVG_HEIGHT) * 100}%`,
              transform: "translate(-50%, -110%)",
            }}
          >
            <p className="text-small font-semibold text-text-primary">
              {formatCurrency(tooltip.point.price)}
            </p>
            <p className="text-small text-text-secondary">
              {formatDateFull(tooltip.point.date)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
