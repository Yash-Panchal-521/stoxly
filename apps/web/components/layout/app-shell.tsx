import { Activity, BellDot, Sparkles, WalletCards } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

const navigationItems = ["Portfolio", "Watchlist", "Trading", "Realtime"];

export function AppShell({ children }: Readonly<AppShellProps>) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-12">
      <div className="surface-panel grid-accent overflow-hidden rounded-[36px] border border-border px-6 py-6 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-6 border-b border-border/80 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <WalletCards className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
                    Stoxly Frontend
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Real-time portfolio operating layer
                  </h1>
                </div>
              </div>
              <p className="max-w-2xl text-balance text-sm leading-7 text-muted sm:text-base">
                A Next.js application scaffolded for live portfolio tracking,
                Firebase authentication, typed service access, and
                SignalR-driven market updates.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <Badge tone="positive" className="w-fit gap-2 px-4 py-1.5">
                <Activity className="h-3.5 w-3.5" />
                Realtime-ready
              </Badge>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                <BellDot className="h-4 w-4" />
                <span>App Router</span>
                <span className="text-border">/</span>
                <span>React Query</span>
                <span className="text-border">/</span>
                <span>Zustand</span>
                <span className="text-border">/</span>
                <span>Firebase</span>
              </div>
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-3">
            {navigationItems.map((item) => (
              <div
                key={item}
                className="rounded-full border border-border bg-white/60 px-4 py-2 text-sm text-muted"
              >
                {item}
              </div>
            ))}
            <div className="ml-auto hidden items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-foreground sm:flex">
              <Sparkles className="h-4 w-4" />
              Production-grade scaffold
            </div>
          </div>

          <div>{children}</div>
        </div>
      </div>
    </main>
  );
}
