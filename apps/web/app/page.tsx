import { AppShell } from "@/components/layout/app-shell";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PortfolioSummary } from "@/features/portfolio/components/portfolio-summary";
import { TradingPanel } from "@/features/trading/components/trading-panel";
import { WatchlistPreview } from "@/features/watchlist/components/watchlist-preview";

export default function Home() {
  return (
    <AppShell>
      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <DashboardHeader />
          <PortfolioSummary />
        </div>
        <TradingPanel />
      </section>
      <section className="mt-8">
        <WatchlistPreview />
      </section>
    </AppShell>
  );
}
