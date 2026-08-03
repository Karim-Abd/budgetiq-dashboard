"use client";

import { useCallback, useEffect, useState } from "react";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// Tables the read-side (dashboards, charts, stat tiles) aggregates from.
export const LIVE_TABLES = [
  "app_users",
  "metrics_daily",
  "kpi_weekly",
  "financial_snapshots",
  "subscriptions",
  "revenue",
  "expenses",
  "posts",
  "hooks",
  "feedback",
  "bugs",
  "dev_tasks",
  "features",
  "tools",
  "onboarding_steps",
  "alerts",
  "video_reviews",
  "waitlist",
  "content_onboarding",
] as const;

export type LiveTable = (typeof LIVE_TABLES)[number];
export type LiveData = Record<LiveTable, Record<string, unknown>[]>;

function emptyData(): LiveData {
  return Object.fromEntries(LIVE_TABLES.map((t) => [t, []])) as unknown as LiveData;
}

/**
 * Fetches every read-side table once. When Supabase isn't configured it returns
 * empty arrays — so the whole UI reads as zero until data is entered.
 */
export function useLive() {
  const [data, setData] = useState<LiveData>(emptyData);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const results = await Promise.all(
      LIVE_TABLES.map((t) => supabase.from(t).select("*")),
    );
    const next = emptyData();
    LIVE_TABLES.forEach((t, i) => {
      next[t] = (results[i].data as Record<string, unknown>[]) ?? [];
    });
    setData(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refresh: load };
}
