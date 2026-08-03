import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

// Clears the session. The client navigates to /login afterwards (base-path aware),
// so this just returns ok.
export async function POST() {
  if (isSupabaseConfigured) {
    const supabase = createClient();
    await supabase.auth.signOut();
  }
  return NextResponse.json({ ok: true });
}
