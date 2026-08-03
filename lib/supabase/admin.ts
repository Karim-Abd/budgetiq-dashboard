import "server-only";

import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. SERVER ONLY (never import in client code).
// Used by the admin portal to create/delete team accounts via the Auth admin API.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const isAdminConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
