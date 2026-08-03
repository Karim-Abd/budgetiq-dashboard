import { NextResponse } from "next/server";

import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";

// Creates the FIRST admin (owner) account — only allowed while no users exist.
// After that, new accounts are created from the in-app admin team portal.
export async function POST(request: Request) {
  if (!isAdminConfigured) {
    return NextResponse.json(
      { error: "Supabase service role key not configured." },
      { status: 400 },
    );
  }

  const { email, password, fullName } = await request.json();
  if (!email || !password || String(password).length < 8) {
    return NextResponse.json(
      { error: "Email and a password of at least 8 characters are required." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "An admin already exists. Ask them to create your account." },
      { status: 403 },
    );
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || email, role: "owner" },
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Ensure the profile reflects owner (the trigger also handles first-user = owner).
  if (data.user) {
    await admin
      .from("profiles")
      .update({ role: "owner", full_name: fullName || email })
      .eq("id", data.user.id);
  }

  return NextResponse.json({ ok: true });
}
