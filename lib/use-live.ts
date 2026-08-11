"use client";

import { useCallback, useEffect, useState } from "react";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// The three tables the OS reads. Each one is written by the public website and
// reviewed here: waitlist signups, support tickets, content-team applications.
export const LIVE_TABLES = [
  "waitlist",
  "support_tickets",
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
