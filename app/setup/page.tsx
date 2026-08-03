import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { SetupForm } from "@/components/auth/setup-form";

export const metadata: Metadata = { title: "First-time setup" };

export default function SetupPage() {
  return (
    <AuthShell
      title="Create your admin account"
      subtitle="This is the owner account. You'll create the rest of the team from inside the app."
      footer={
        <>
          Already set up?{" "}
          <Link href="/login" className="text-info underline-offset-2 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SetupForm />
    </AuthShell>
  );
}
