"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { PortfolioSummary } from "@/features/portfolio/components/portfolio-summary";
import { TradingPanel } from "@/features/trading/components/trading-panel";
import { WatchlistPreview } from "@/features/watchlist/components/watchlist-preview";

export function DashboardGate() {
  const { isLoading, logout, user } = useAuthContext();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    setLogoutError(null);

    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign out.";

      setLogoutError(message);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <section className="mb-8 flex flex-col gap-4 rounded-[28px] border border-border bg-surface-strong/80 px-8 py-7 shadow-[0_0_32px_rgba(34,211,238,0.08)] lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
              Signed in
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {user?.displayName ?? user?.email ?? "Authenticated session"}
            </h2>
            <p className="text-sm text-muted">
              Your session token stays in memory and is attached to protected
              API requests automatically.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="text-sm font-semibold text-primary"
              href="/register"
            >
              Create another account
            </Link>
            <Button disabled={isLoading} variant="ghost" onClick={handleLogout}>
              {isLoading ? "Signing out..." : "Logout"}
            </Button>
          </div>
        </section>

        {logoutError ? (
          <div className="mb-6 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            {logoutError}
          </div>
        ) : null}

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
    </ProtectedRoute>
  );
}
