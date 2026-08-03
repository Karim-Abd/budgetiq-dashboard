"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, TriangleAlert } from "lucide-react";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { apiPath } from "@/lib/base-path";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ configured: boolean; needsSetup: boolean } | null>(null);

  useEffect(() => {
    fetch(apiPath("/api/auth/status"))
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ configured: isSupabaseConfigured, needsSetup: false }));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Supabase isn't configured yet. Add your keys to .env.local and restart.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  if (status && !status.configured) {
    return (
      <div className="space-y-3 rounded-lg border border-info/20 bg-info/5 p-4 text-sm">
        <div className="flex items-center gap-2 text-info">
          <TriangleAlert className="h-4 w-4" />
          <span className="font-medium">Supabase not connected</span>
        </div>
        <p className="text-muted-foreground">
          Add <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and
          your keys to <code className="font-mono text-xs">.env.local</code>, then restart.
          See the README for the 3-step setup.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {status?.needsSetup && (
        <div className="rounded-lg border border-growth/20 bg-growth/5 p-3 text-xs text-muted-foreground">
          No accounts yet.{" "}
          <Link href="/setup" className="font-medium text-growth underline-offset-2 hover:underline">
            Create the admin account →
          </Link>
        </div>
      )}
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@budgetiq.app" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-critical">
          <TriangleAlert className="h-3.5 w-3.5" /> {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign in"}
      </Button>
    </form>
  );
}
