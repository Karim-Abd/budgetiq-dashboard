import { redirect } from "next/navigation";

// The Waitlist section used to live here. Customer Support is now the first
// section, so the index route just hands off to it — `/` stays a valid entry
// point (the sidebar wordmark and the middleware matcher both still use it).
export default function DashboardIndex() {
  redirect("/support");
}
