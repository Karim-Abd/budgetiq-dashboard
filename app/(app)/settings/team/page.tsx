import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, TriangleAlert } from "lucide-react";

import { getUser, getProfile, isAdminRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { TeamManager } from "@/components/settings/team-manager";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-xl border border-info/20 bg-info/5 p-5">
        <div className="flex items-center gap-2 text-info">
          <TriangleAlert className="h-4 w-4" />
          <span className="text-sm font-medium">Connect Supabase to manage accounts</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Account creation needs a Supabase project. Add your keys to{" "}
          <code className="font-mono text-xs">.env.local</code> and run the schema —
          see the <Link href="/settings/integrations" className="text-info underline-offset-2 hover:underline">README setup</Link> — then this becomes the admin portal where you create and manage team logins.
        </p>
      </div>
    );
  }

  const [user, profile] = await Promise.all([getUser(), getProfile()]);

  if (!isAdminRole(profile?.role)) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <ShieldAlert className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Admins only</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask an owner or admin to manage team accounts.
        </p>
      </div>
    );
  }

  return <TeamManager currentUserId={user!.id} />;
}
