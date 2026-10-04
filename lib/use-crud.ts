"use client";

import { useCallback, useEffect, useState } from "react";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export interface CrudRow {
  [key: string]: unknown;
}

/** Mock-mode equivalent of the `.match()` applied to the live query. */
function matchesFilter<T extends CrudRow>(rows: T[], filter?: Record<string, string>): T[] {
  if (!filter) return rows;
  const pairs = Object.entries(filter);
  return rows.filter((r) => pairs.every(([k, v]) => String(r[k]) === v));
}

interface UseCrudOptions<T> {
  mock?: T[];
  orderBy?: string;
  ascending?: boolean;
  /** primary key column — defaults to "id" (some metric tables key on a date) */
  pk?: string;
  /**
   * Column/value pairs this view is restricted to. Applied to the read, and
   * stamped onto every row created here — so the Expenses tab can hold one
   * slice of finance_transactions without the form asking which kind it is.
   */
  filter?: Record<string, string>;
}

/**
 * Live CRUD against a Supabase table with a graceful mock fallback.
 * When Supabase isn't configured, it operates on in-memory mock data so the UI
 * stays fully interactive (changes are local-only and flagged via a toast).
 */
export function useCrud<T extends CrudRow>(
  table: string,
  { mock = [], orderBy = "created_at", ascending = false, pk = "id", filter }: UseCrudOptions<T> = {},
) {
  // Serialised so the effect below compares by value — a fresh `{ kind: "income" }`
  // object literal on every render would otherwise refetch forever.
  const filterKey = JSON.stringify(filter ?? null);
  const [rows, setRows] = useState<T[]>(() =>
    isSupabaseConfigured ? [] : matchesFilter(mock, filter),
  );
  const [loading, setLoading] = useState(isSupabaseConfigured);
  /** the table doesn't exist yet — the section's migration hasn't been run */
  const [missing, setMissing] = useState(false);

  const keyOf = (r: T) => String(r[pk]);

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const supabase = createClient();
    const parsed = JSON.parse(filterKey) as Record<string, string> | null;
    let query = supabase.from(table).select("*");
    if (parsed) query = query.match(parsed);
    const { data, error } = await query.order(orderBy, { ascending });
    if (error) {
      // A missing table is a setup step, not a failure worth a red toast — the
      // table renders a "run the migration" notice instead.
      if (error.code === "42P01") setMissing(true);
      else toast.error(`Couldn't load ${table}`, error.message);
    } else if (data) {
      setMissing(false);
      setRows(data as T[]);
    }
    setLoading(false);
  }, [table, orderBy, ascending, filterKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const create = useCallback(
    async (input: Partial<T>) => {
      // The view's filter is part of the row's identity, so it is stamped on
      // rather than left to the form.
      const row = { ...input, ...(JSON.parse(filterKey) ?? {}) } as Partial<T>;
      if (!isSupabaseConfigured) {
        const optimistic = { ...row, [pk]: `local-${Date.now()}` } as unknown as T;
        setRows((p) => [optimistic, ...p]);
        toast.info("Saved locally", "Connect Supabase to persist this.");
        return optimistic;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from(table)
        .insert(row as never)
        .select()
        .single();
      if (error) {
        toast.error("Couldn't save", error.message);
        return null;
      }
      setRows((p) => [data as T, ...p]);
      toast.success("Saved");
      return data as T;
    },
    [table, pk, filterKey],
  );

  const update = useCallback(
    async (id: string, row: Partial<T>) => {
      if (!isSupabaseConfigured) {
        setRows((p) => p.map((r) => (keyOf(r) === id ? { ...r, ...row } : r)));
        toast.info("Updated locally");
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from(table)
        .update(row as never)
        .eq(pk, id)
        .select()
        .single();
      if (error) {
        toast.error("Couldn't update", error.message);
        return;
      }
      setRows((p) => p.map((r) => (keyOf(r) === id ? (data as T) : r)));
      toast.success("Updated");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, pk],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!isSupabaseConfigured) {
        setRows((p) => p.filter((r) => keyOf(r) !== id));
        toast.info("Removed locally");
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from(table).delete().eq(pk, id);
      if (error) {
        toast.error("Couldn't delete", error.message);
        return;
      }
      setRows((p) => p.filter((r) => keyOf(r) !== id));
      toast.success("Deleted");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, pk],
  );

  return { rows, loading, missing, configured: isSupabaseConfigured, refetch, create, update, remove };
}
