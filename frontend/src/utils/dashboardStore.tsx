import { create } from "zustand";

export type DashboardLayout = "default" | "compact" | "expanded";

interface DashboardState {
  layout: DashboardLayout;
  setLayout: (layout: DashboardLayout) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  layout: "default",
  setLayout: (layout) => set({ layout }),
}));
