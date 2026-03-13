"use client";

import { useCallback, useId, useRef, useState } from "react";
import type { PerformanceDataPoint } from "@/types/portfolio";
import { usePerformance } from "@/hooks/use-performance";

// ─── helpers ─────────────────────────────────────────────────────────────────

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

// Build a smooth SVG path using cardinal spline interpolation.
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

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

// ─── Range buttons ─────────────────────────────────────────────────────────────

type Range = "1M" | "3M" | "6M" | "1Y" | "ALL";

const RANGES: Range[] = ["1M", "3M", "6M", "1Y", "ALL"];

function filterByRange(
  data: PerformanceDataPoint[],
  range: Range,
): PerformanceDataPoint[] {
  if (range === "ALL" || data.length === 0) return data;
  const now = new Date();
  const cutoffs: Record<Range, number> = {
    "1M": 1,
    "3M": 3,
    "6M": 6,
    "1Y": 12,
    ALL: 0,
  };
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - cutoffs[range]);
  return data.filter((d) => new Date(d.date) >= cutoff);
}

// ─── Main component ──────────────────────────────────────────────────────────

interface PerformanceChartProps {
  readonly portfolioId: string;
}

interface TooltipState {
  x: number;
  y: number;
  point: PerformanceDataPoint;
}

const PADDING = { top: 16, right: 12, bottom: 32, left: 56 };
const SVG_HEIGHT = 220;

export default function PerformanceChart({
  portfolioId,
}: PerformanceChartProps) {
  const { data, isLoading, isError } = usePerformance(portfolioId);
  const [range, setRange] = useState<Range>("ALL");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientId = useId().replaceAll(":", "");

  const filtered = filterByRange(data ?? [], range);

  const computePoints = useCallback(
    (width: number) => {
      if (filtered.length === 0) return { points: [], minVal: 0, maxVal: 0 };

      const values = filtered.map((d) => d.value);
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const valRange = maxVal - minVal || 1;

      const innerW = width - PADDING.left - PADDING.right;
      const innerH = SVG_HEIGHT - PADDING.top - PADDING.bottom;

      const points = filtered.map((d, i) => ({
        x: PADDING.left + (i / (filtered.length - 1 || 1)) * innerW,
        y: PADDING.top + innerH - ((d.value - minVal) / valRange) * innerH,
      }));

      return { points, minVal, maxVal };
    },
    [filtered],
  );

  // ── Rendering ────────────────────────────────────────────────────────────
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

  const firstValue = filtered[0]?.value ?? 0;
  const lastValue = filtered.at(-1)?.value ?? 0;
  const change = lastValue - firstValue;
  const changePct = firstValue === 0 ? 0 : (change / firstValue) * 100;
  const isPositive = change >= 0;

  // Use a fixed render width for SSR — the SVG has viewBox so it scales.
  const svgWidth = 800;
  const { points, minVal, maxVal } = computePoints(svgWidth);

  const linePath = buildSmoothPath(points);
  const innerH = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  // Area path closes below the line
  const areaPath =
    points.length > 0
      ? `${linePath} L ${(points.at(-1) ?? points[0]).x} ${PADDING.top + innerH} L ${points[0].x} ${PADDING.top + innerH} Z`
      : "";

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    value: minVal + t * (maxVal - minVal),
    y: PADDING.top + innerH - t * innerH,
  }));

  // X-axis labels — show ~5 evenly spaced dates
  const xLabelCount = Math.min(5, filtered.length);
  const xLabels =
    filtered.length > 0
      ? Array.from({ length: xLabelCount }, (_, i) => {
          const idx = Math.round(
            (i / (xLabelCount - 1 || 1)) * (filtered.length - 1),
          );
          return {
            label: formatDateShort(filtered[idx].date),
            x:
              PADDING.left +
              (idx / (filtered.length - 1 || 1)) *
                (svgWidth - PADDING.left - PADDING.right),
          };
        })
      : [];

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    // Map client X → SVG coordinate space
    const scaleX = svgWidth / rect.width;
    const svgX = (e.clientX - rect.left) * scaleX;

    // Find nearest data point
    let nearest = 0;
    let minDist = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(p.x - svgX);
      if (d < minDist) {
        minDist = d;
        nearest = i;
      }
    });

    setTooltip({
      x: points[nearest].x,
      y: points[nearest].y,
      point: filtered[nearest],
    });
  }

  const lineColor = isPositive ? "rgb(34,197,94)" : "rgb(239,68,68)";
  const gradientStart = isPositive
    ? "rgba(34,197,94,0.25)"
    : "rgba(239,68,68,0.25)";

  return (
    <div className="stoxly-card space-y-4">
      {/* Header */}
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

      {/* Chart */}
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${SVG_HEIGHT}`}
          className="w-full overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
          aria-label="Portfolio performance chart"
        >
          <defs>
            <linearGradient
              id={`grad-${gradientId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={gradientStart} />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
          </defs>

          {/* Grid lines + Y labels */}
          {yTicks.map((t) => (
            <g key={t.y}>
              <line
                x1={PADDING.left}
                y1={t.y}
                x2={svgWidth - PADDING.right}
                y2={t.y}
                style={{ stroke: "rgb(var(--border))", strokeOpacity: 0.7 }}
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 8}
                y={t.y + 4}
                textAnchor="end"
                fontSize={9}
                style={{ fill: "rgb(var(--muted))" }}
              >
                {formatCurrency(t.value)}
              </text>
            </g>
          ))}

          {/* X labels */}
          {xLabels.map((l) => (
            <text
              key={l.x}
              x={l.x}
              y={SVG_HEIGHT - 6}
              textAnchor="middle"
              fontSize={9}
              style={{ fill: "rgb(var(--muted))" }}
            >
              {l.label}
            </text>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill={`url(#grad-${gradientId})`} />

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
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <circle
                cx={tooltip.x}
                cy={tooltip.y}
                r={4}
                fill={lineColor}
                stroke="white"
                strokeWidth={2}
              />
            </>
          )}
        </svg>

        {/* Floating tooltip card */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 rounded-xl border border-border bg-card px-3 py-2 shadow-sm"
            style={{
              left: `${Math.min((tooltip.x / svgWidth) * 100, 75)}%`,
              top: `${Math.max(((tooltip.y - PADDING.top) / (SVG_HEIGHT - PADDING.top - PADDING.bottom)) * 100 - 20, 0)}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="text-small text-text-secondary">
              {formatDate(tooltip.point.date)}
            </p>
            <p className="text-body font-semibold text-text-primary">
              {formatCurrency(tooltip.point.value)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
