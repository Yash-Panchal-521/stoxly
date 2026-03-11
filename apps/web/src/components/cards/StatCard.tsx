type Trend = "up" | "down" | "neutral";

interface StatCardProps {
  readonly title: string;
  readonly value: string;
  readonly change?: string;
  readonly trend?: Trend;
  readonly children?: React.ReactNode;
}

function getTrendClass(trend: Trend): string {
  if (trend === "up") return "trend-up";
  if (trend === "down") return "trend-down";
  return "trend-neutral";
}

function getTrendIcon(trend: Trend): string {
  if (trend === "up") return "↑";
  if (trend === "down") return "↓";
  return "–";
}

export default function StatCard({
  title,
  value,
  change,
  trend = "neutral",
  children,
}: StatCardProps) {
  return (
    <div className="stoxly-card flex flex-col gap-3">
      <span className="text-small text-text-secondary">{title}</span>
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-h2">{value}</span>
          {change && (
            <span className={`text-small font-medium ${getTrendClass(trend)}`}>
              {getTrendIcon(trend)} {change}
            </span>
          )}
        </div>
        {children && <div className="h-12 w-24">{children}</div>}
      </div>
    </div>
  );
}
