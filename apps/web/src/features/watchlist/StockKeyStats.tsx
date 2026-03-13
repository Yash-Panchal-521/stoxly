import type { StockPrice } from "@/types/market";

interface StockKeyStatsProps {
  readonly price: StockPrice | undefined;
}

function formatCurrency(v: number | undefined): string {
  if (v === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

interface StatItemProps {
  readonly label: string;
  readonly value: string;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-small text-text-secondary">{label}</span>
      <span className="text-body font-semibold text-text-primary">{value}</span>
    </div>
  );
}

export default function StockKeyStats({ price }: StockKeyStatsProps) {
  return (
    <div className="stoxly-card">
      <h2 className="mb-4 text-h3">Key Statistics</h2>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
        <StatItem label="Open" value={formatCurrency(price?.openPrice)} />
        <StatItem label="Day High" value={formatCurrency(price?.highPrice)} />
        <StatItem label="Day Low" value={formatCurrency(price?.lowPrice)} />
        <StatItem
          label="Prev. Close"
          value={formatCurrency(price?.previousClose)}
        />
      </div>
    </div>
  );
}
