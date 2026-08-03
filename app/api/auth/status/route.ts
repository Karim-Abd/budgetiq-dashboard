import { NextResponse } from "next/server";

import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";

// Tells the login/setup screens whether Supabase is wired and whether the very
// first admin still needs to be created.
export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ configured: false, needsSetup: false });
  }
  if (!isAdminConfigured) {
    // Anon configured but no service role — can't bootstrap or manage accounts.
    return NextResponse.json({ configured: true, needsSetup: false, adminReady: false });
  }
  try {
    const admin = createAdminClient();
    const { count, error } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({
      configured: true,
      adminReady: true,
      needsSetup: (count ?? 0) === 0,
    });
  } catch (e) {
    return NextResponse.json(
      { configured: true, adminReady: true, needsSetup: false, error: "status_failed" },
      { status: 200 },
    );
  }
}
