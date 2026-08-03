"use client";

import { useCallback, useEffect, useState } from "react";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export interface CrudRow {
  [key: string]: unknown;
}

interface UseCrudOptions<T> {
  mock?: T[];
  orderBy?: string;
  ascending?: boolean;
  /** primary key column — defaults to "id" (some metric tables key on a date) */
  pk?: string;
}

/**
 * Live CRUD against a Supabase table with a graceful mock fallback.
 * When Supabase isn't configured, it operates on in-memory mock data so the UI
 * stays fully interactive (changes are local-only and flagged via a toast).
 */
export function useCrud<T extends CrudRow>(
  table: string,
  { mock = [], orderBy = "created_at", ascending = false, pk = "id" }: UseCrudOptions<T> = {},
) {
  const [rows, setRows] = useState<T[]>(isSupabaseConfigured ? [] : mock);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const keyOf = (r: T) => String(r[pk]);

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(orderBy, { ascending });
    if (error) toast.error(`Couldn't load ${table}`, error.message);
    else if (data) setRows(data as T[]);
    setLoading(false);
  }, [table, orderBy, ascending]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const create = useCallback(
    async (row: Partial<T>) => {
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
    [table, pk],
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

  return { rows, loading, configured: isSupabaseConfigured, refetch, create, update, remove };
}
