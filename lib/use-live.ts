"use client";

import { useCallback, useEffect, useState } from "react";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// The tables the OS reads. The first three are written by the public website
// and reviewed here (waitlist signups, support tickets, content-team
// applications); the finance pair is entered by the team in the OS itself.
export const LIVE_TABLES = [
  "waitlist",
  "support_tickets",
  "content_onboarding",
  "finance_transactions",
  "finance_subscriptions",
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
  // Tables Postgres doesn't have yet, so a section whose migration hasn't been
  // run can say so instead of rendering a confident row of zeros.
  const [missing, setMissing] = useState<string[]>([]);

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
    const absent: string[] = [];
    LIVE_TABLES.forEach((t, i) => {
      // 42P01 = undefined_table: the migration for this section hasn't run.
      if (results[i].error?.code === "42P01") absent.push(t);
      next[t] = (results[i].data as Record<string, unknown>[]) ?? [];
    });
    setData(next);
    setMissing(absent);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, missing, refresh: load };
}
