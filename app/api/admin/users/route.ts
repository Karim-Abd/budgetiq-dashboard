import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";

// Verifies the caller is a signed-in admin/owner. Returns their user id, or a
// NextResponse to short-circuit with the right error.
async function requireAdmin() {
  if (!isAdminConfigured) {
    return { error: NextResponse.json({ error: "Admin not configured." }, { status: 400 }) };
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || (profile.role !== "owner" && profile.role !== "admin")) {
    return { error: NextResponse.json({ error: "Admins only." }, { status: 403 }) };
  }
  return { userId: user.id };
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { email, password, fullName, role } = await request.json();
  if (!email || !password || String(password).length < 8) {
    return NextResponse.json(
      { error: "Email and a password of at least 8 characters are required." },
      { status: 400 },
    );
  }
  const safeRole = role === "admin" ? "admin" : "member";

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || email, role: safeRole },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (data.user) {
    await admin
      .from("profiles")
      .update({ role: safeRole, full_name: fullName || email })
      .eq("id", data.user.id);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing user id." }, { status: 400 });
  if (id === auth.userId) {
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
