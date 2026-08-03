"use client";

import { create } from "zustand";
import type { DateRange } from "@/lib/nav";

interface OsState {
  dateRange: DateRange;
  setDateRange: (r: DateRange) => void;
}

// Global UI state. Kept tiny — the date range drives the top-level filter and
// is read by dashboard widgets. (Wire to real queries once Supabase is live.)
export const useOsStore = create<OsState>((set) => ({
  dateRange: "Last 30 days",
  setDateRange: (dateRange) => set({ dateRange }),
}));
