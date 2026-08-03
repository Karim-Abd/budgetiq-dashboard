"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, TriangleAlert, ShieldCheck } from "lucide-react";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { apiPath } from "@/lib/base-path";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SetupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(apiPath("/api/auth/status"))
      .then((r) => r.json())
      .then((s) => setNeedsSetup(s.needsSetup))
      .catch(() => setNeedsSetup(true));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch(apiPath("/api/auth/bootstrap"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create the admin account.");
      setBusy(false);
      return;
    }
    // Sign straight in.
    if (isSupabaseConfigured) {
      const supabase = createClient();
      await supabase.auth.signInWithPassword({ email, password });
    }
    router.push("/");
    router.refresh();
  }

  if (needsSetup === false) {
    return (
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-growth">
          <ShieldCheck className="h-4 w-4" />
          <span className="font-medium">Admin already exists</span>
        </div>
        <p className="text-muted-foreground">
          The owner account is set up. Ask an admin to create your account, then{" "}
          <Link href="/login" className="font-medium text-info underline-offset-2 hover:underline">
            sign in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Karim S." />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@budgetiq.app" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="At least 8 characters" />
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-critical">
          <TriangleAlert className="h-3.5 w-3.5" /> {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : "Create admin account"}
      </Button>
    </form>
  );
}
