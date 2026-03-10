"use client";

import { create } from "zustand";

type DashboardView = "overview" | "focus";

type DashboardViewStore = {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
};

export const useDashboardView = create<DashboardViewStore>((set) => ({
  activeView: "overview",
  setActiveView: (activeView) => set({ activeView }),
}));
