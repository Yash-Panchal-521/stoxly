"use client";

import { LayoutGrid, Rows4 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardView } from "@/hooks/use-dashboard-view";

export function DashboardHeader() {
  const activeView = useDashboardView((state) => state.activeView);
  const setActiveView = useDashboardView((state) => state.setActiveView);

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-border bg-surface-strong px-6 py-5 shadow-[0_0_32px_rgba(34,211,238,0.06)] sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted">
          Workspace state
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          Overview modules with isolated client state.
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={activeView === "overview" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveView("overview")}
        >
          <LayoutGrid className="h-4 w-4" />
          Overview
        </Button>
        <Button
          variant={activeView === "focus" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveView("focus")}
        >
          <Rows4 className="h-4 w-4" />
          Focus
        </Button>
      </div>
    </div>
  );
}
