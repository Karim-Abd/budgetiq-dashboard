import "server-only";

import { createClient } from "@/lib/supabase/server";

export type Role = "owner" | "admin" | "member";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  avatar_url: string | null;
}

// Current authenticated user (or null). Safe to call when Supabase is unconfigured.
export async function getUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Current user's profile row (includes role).
export async function getProfile(): Promise<Profile | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .eq("id", user.id)
    .single();
  return (data as Profile) ?? null;
}

export function isAdminRole(role?: Role | null) {
  return role === "owner" || role === "admin";
}
