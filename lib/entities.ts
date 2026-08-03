import type { EntityConfig } from "@/components/data/crud-table";

// Field schemas for every editable table. Keys match the Supabase columns 1:1.
// `mock` seeds (snake_case, with an id) keep the UI alive before Supabase is
// connected; once it is, useCrud reads live rows instead.

export const postsEntity: EntityConfig = {
  table: "posts",
  title: "Posts",
  singular: "post",
  orderBy: "publish_date",
  fields: [
    { key: "title", label: "Title", type: "text", required: true, placeholder: "3 money traps every student falls for" },
    { key: "format", label: "Format", type: "select", options: ["Reel", "Carousel", "Story", "Static"], badgeMap: { Reel: "info", Carousel: "growth", Story: "muted", Static: "secondary" } },
    { key: "status", label: "Status", type: "select", options: ["draft", "scheduled", "published", "archived"], badgeMap: { published: "growth", scheduled: "info", draft: "muted", archived: "secondary" } },
    { key: "platform", label: "Platform", type: "select", options: ["Instagram", "TikTok", "YouTube", "X"] },
    { key: "avatar", label: "Avatar", type: "text", placeholder: "Maya the Mentor" },
    { key: "hook", label: "Hook", type: "text", hideInTable: true },
    { key: "caption", label: "Caption", type: "textarea", hideInTable: true },
    { key: "publish_date", label: "Publish", type: "date" },
    { key: "reach", label: "Reach", type: "number" },
    { key: "impressions", label: "Impressions", type: "number", hideInTable: true },
    { key: "likes", label: "Likes", type: "number", hideInTable: true },
    { key: "comments", label: "Comments", type: "number", hideInTable: true },
    { key: "saves", label: "Saves", type: "number" },
    { key: "shares", label: "Shares", type: "number", hideInTable: true },
  ],
  mock: [
    { id: "p1", title: "3 money traps every student falls for", format: "Reel", status: "published", platform: "Instagram", avatar: "Maya the Mentor", hook: "You're losing $200/mo without noticing", publish_date: "2026-06-26", reach: 48200, impressions: 61300, likes: 3120, comments: 284, saves: 1890, shares: 642 },
    { id: "p3", title: "The 50/30/20 rule is lying to you", format: "Reel", status: "published", platform: "TikTok", avatar: "Dex the Analyst", hook: "Your favorite budget rule is broken", publish_date: "2026-06-22", reach: 72500, impressions: 91200, likes: 5410, comments: 612, saves: 3120, shares: 1240 },
    { id: "p5", title: "Student loan myths, debunked", format: "Carousel", status: "scheduled", platform: "Instagram", avatar: "Dex the Analyst", hook: "Everything you heard about loans is wrong", publish_date: "2026-07-01", reach: 0, impressions: 0, likes: 0, comments: 0, saves: 0, shares: 0 },
  ],
};

export const avatarsEntity: EntityConfig = {
  table: "avatars",
  title: "Avatars",
  singular: "avatar",
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "tone", label: "Tone", type: "text" },
    { key: "visual_style", label: "Visual style", type: "text" },
    { key: "bio", label: "Bio", type: "textarea", hideInTable: true },
    { key: "content_pillars", label: "Content pillars", type: "tags", placeholder: "Budgeting, Mindset, Q&A" },
  ],
  mock: [
    { id: "av1", name: "Maya the Mentor", tone: "Supportive, plainspoken", visual_style: "Warm tones, handwritten overlays", bio: "Calm finance big-sister for first-years.", content_pillars: ["Budgeting basics", "Mindset", "Q&A"] },
    { id: "av2", name: "Dex the Analyst", tone: "Sharp, contrarian", visual_style: "Dark UI, charts, neon accents", bio: "Data-driven myth-buster.", content_pillars: ["Myth-busting", "Comparisons"] },
  ],
};

export const hooksEntity: EntityConfig = {
  table: "hooks",
  title: "Hooks",
  singular: "hook",
  fields: [
    { key: "text", label: "Hook", type: "text", required: true },
    { key: "format", label: "Format", type: "select", options: ["Reel", "Carousel", "Story", "Static"] },
    { key: "category", label: "Category", type: "select", options: ["curiosity", "pain_point", "number_based", "question", "bold_claim"], optionLabels: { curiosity: "Curiosity", pain_point: "Pain point", number_based: "Number", question: "Question", bold_claim: "Bold claim" }, badgeMap: { curiosity: "info", pain_point: "default", number_based: "growth", question: "secondary", bold_claim: "muted" } },
    { key: "date_tested", label: "Tested", type: "date" },
    { key: "performance_score", label: "Score", type: "number" },
  ],
  mock: [
    { id: "h1", text: "You're losing $200/mo without noticing", format: "Reel", category: "pain_point", date_tested: "2026-06-26", performance_score: 9.4 },
    { id: "h2", text: "Your favorite budget rule is broken", format: "Reel", category: "bold_claim", date_tested: "2026-06-22", performance_score: 9.1 },
  ],
};

export const videoReviewsEntity: EntityConfig = {
  table: "video_reviews",
  title: "Video reviews",
  singular: "review",
  orderBy: "reviewed_at",
  fields: [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "video_url", label: "Video URL", type: "text", hideInTable: true },
    { key: "rating", label: "Rating", type: "number" },
    { key: "hook_strength", label: "Hook", type: "number", hideInTable: true },
    { key: "pacing", label: "Pacing", type: "number", hideInTable: true },
    { key: "cta_score", label: "CTA", type: "number", hideInTable: true },
    { key: "caption_score", label: "Caption", type: "number", hideInTable: true },
    { key: "suggestions", label: "Suggestions", type: "textarea" },
  ],
  mock: [
    { id: "v2", title: "50/30/20 debunk v2", video_url: "", rating: 9.1, hook_strength: 9, pacing: 9, cta_score: 9, caption_score: 8, suggestions: "Add captions in first frame." },
    { id: "v3", title: "No-spend weekend recap", video_url: "", rating: 5.4, hook_strength: 5, pacing: 6, cta_score: 4, caption_score: 6, suggestions: "Open on the result; no clear CTA." },
  ],
};

export const scrapedAccountsEntity: EntityConfig = {
  table: "scraped_accounts",
  title: "Scraped accounts",
  singular: "account",
  orderBy: "scraped_at",
  fields: [
    { key: "account", label: "Account", type: "text", required: true },
    { key: "post_type", label: "Type", type: "text" },
    { key: "hook", label: "Hook", type: "text" },
    { key: "est_reach", label: "Est. reach", type: "number" },
    { key: "engagement_rate", label: "ER %", type: "number" },
    { key: "notes", label: "Notes", type: "textarea", hideInTable: true },
  ],
  mock: [
    { id: "s3", account: "@moneywithmel", post_type: "Reel", hook: "Stop budgeting. Do this instead.", est_reach: 210000, engagement_rate: 14.8, notes: "Contrarian hook — top performer." },
    { id: "s1", account: "@thebudgetbabe", post_type: "Reel", hook: "I saved $5k in 6 months as a student", est_reach: 120000, engagement_rate: 12.4, notes: "Personal-result hooks win." },
  ],
};

export const revenueEntity: EntityConfig = {
  table: "revenue",
  title: "Revenue",
  singular: "payment",
  orderBy: "payment_date",
  fields: [
    { key: "payer", label: "Payer", type: "text", required: true },
    { key: "plan", label: "Plan", type: "select", options: ["plus", "pro"], optionLabels: { plus: "Plus", pro: "Pro" }, badgeMap: { plus: "info", pro: "growth" } },
    { key: "amount", label: "Amount", type: "currency" },
    { key: "payment_method", label: "Method", type: "select", options: ["card", "apple_pay", "google_pay", "paypal"], optionLabels: { card: "Card", apple_pay: "Apple Pay", google_pay: "Google Pay", paypal: "PayPal" } },
    { key: "status", label: "Status", type: "select", options: ["paid", "pending", "refunded", "failed"], badgeMap: { paid: "growth", pending: "info", refunded: "muted", failed: "critical" } },
    { key: "payment_date", label: "Date", type: "date" },
  ],
  mock: [
    { id: "r1", payer: "ava.chen@uni.edu", plan: "pro", amount: 9.99, payment_method: "card", status: "paid", payment_date: "2026-06-28" },
    { id: "r2", payer: "liam.ortiz@uni.edu", plan: "plus", amount: 4.99, payment_method: "apple_pay", status: "paid", payment_date: "2026-06-28" },
  ],
};

export const expensesEntity: EntityConfig = {
  table: "expenses",
  title: "Expenses",
  singular: "expense",
  orderBy: "expense_date",
  fields: [
    { key: "vendor", label: "Vendor", type: "text", required: true },
    { key: "category", label: "Category", type: "select", options: ["tools", "marketing", "contractors", "infra", "legal", "other"], badgeMap: { tools: "muted", marketing: "info", contractors: "secondary", infra: "muted", legal: "muted", other: "muted" } },
    { key: "amount", label: "Amount", type: "currency" },
    { key: "billing_cycle", label: "Cycle", type: "select", options: ["monthly", "annual", "one_time"], optionLabels: { monthly: "Monthly", annual: "Annual", one_time: "One-time" } },
    { key: "expense_date", label: "Date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea", hideInTable: true },
  ],
  mock: [
    { id: "e4", vendor: "Meta Ads", category: "marketing", amount: 1450, billing_cycle: "monthly", expense_date: "2026-06-12", notes: "Reel boosts + retargeting" },
    { id: "e1", vendor: "Supabase", category: "infra", amount: 25, billing_cycle: "monthly", expense_date: "2026-06-05", notes: "Pro plan" },
  ],
};

export const subscriptionsEntity: EntityConfig = {
  table: "subscriptions",
  title: "Subscriptions",
  singular: "subscription",
  orderBy: "billing_date",
  ascending: true,
  fields: [
    { key: "payer", label: "Payer", type: "text", required: true },
    { key: "plan", label: "Plan", type: "select", options: ["plus", "pro"], optionLabels: { plus: "Plus", pro: "Pro" }, badgeMap: { plus: "info", pro: "growth" } },
    { key: "price", label: "Price", type: "currency" },
    { key: "billing_cycle", label: "Cycle", type: "select", options: ["monthly", "annual"], optionLabels: { monthly: "Monthly", annual: "Annual" } },
    { key: "billing_date", label: "Next billing", type: "date" },
    { key: "renewal_status", label: "Renewal", type: "select", options: ["active", "at_risk", "past_due", "canceled"], optionLabels: { active: "Active", at_risk: "At risk", past_due: "Past due", canceled: "Canceled" }, badgeMap: { active: "growth", at_risk: "info", past_due: "critical", canceled: "muted" } },
  ],
  mock: [
    { id: "su1", payer: "ava.chen@uni.edu", plan: "pro", price: 9.99, billing_cycle: "monthly", billing_date: "2026-07-01", renewal_status: "active" },
    { id: "su4", payer: "noah.kim@uni.edu", plan: "pro", price: 9.99, billing_cycle: "monthly", billing_date: "2026-07-03", renewal_status: "at_risk" },
  ],
};

export const financialSnapshotsEntity: EntityConfig = {
  table: "financial_snapshots",
  title: "Monthly snapshots",
  singular: "month",
  orderBy: "month",
  ascending: true,
  pk: "month",
  description: "feeds MRR, P&L & runway",
  fields: [
    { key: "month", label: "Month", type: "date", required: true },
    { key: "mrr", label: "MRR", type: "currency" },
    { key: "expansion_mrr", label: "Expansion", type: "currency", hideInTable: true },
    { key: "churned_mrr", label: "Churned", type: "currency", hideInTable: true },
    { key: "new_customers", label: "New customers", type: "number" },
    { key: "paying_users", label: "Paying users", type: "number" },
    { key: "marketing_spend", label: "Marketing $", type: "currency", hideInTable: true },
    { key: "gross_margin_pct", label: "Gross margin %", type: "number", hideInTable: true },
    { key: "cash_on_hand", label: "Cash", type: "currency" },
  ],
  mock: [
    { id: "2026-05-01", month: "2026-05-01", mrr: 7100, expansion_mrr: 320, churned_mrr: 210, new_customers: 84, paying_users: 1180, marketing_spend: 1300, gross_margin_pct: 86, cash_on_hand: 46000 },
    { id: "2026-06-01", month: "2026-06-01", mrr: 8240, expansion_mrr: 410, churned_mrr: 180, new_customers: 96, paying_users: 1386, marketing_spend: 1450, gross_margin_pct: 86, cash_on_hand: 42500 },
  ],
};

export const devTasksEntity: EntityConfig = {
  table: "dev_tasks",
  title: "Tasks",
  singular: "task",
  orderBy: "order_index",
  ascending: true,
  fields: [
    { key: "title", label: "Task", type: "text", required: true },
    { key: "description", label: "Description", type: "textarea", hideInTable: true },
    { key: "status", label: "Status", type: "select", options: ["backlog", "todo", "in_progress", "review", "done"], optionLabels: { backlog: "Backlog", todo: "To Do", in_progress: "In Progress", review: "Review", done: "Done" }, badgeMap: { backlog: "muted", todo: "info", in_progress: "info", review: "secondary", done: "growth" } },
    { key: "priority", label: "Priority", type: "select", options: ["P0", "P1", "P2"], badgeMap: { P0: "critical", P1: "info", P2: "muted" } },
    { key: "assignee", label: "Assignee", type: "text" },
    { key: "due_date", label: "Due", type: "date" },
  ],
  mock: [
    { id: "t1", title: "Fix budget sync on iOS 18.2", description: "Sync silently fails post-update.", status: "in_progress", priority: "P0", assignee: "Sam", due_date: "2026-06-30", order_index: 0 },
    { id: "t2", title: "Simplify bank-connect step", description: "Step 3 drop-off at 41%.", status: "todo", priority: "P1", assignee: "Priya", due_date: "2026-07-04", order_index: 1 },
  ],
};

export const featuresEntity: EntityConfig = {
  table: "features",
  title: "Features",
  singular: "feature",
  fields: [
    { key: "name", label: "Feature", type: "text", required: true },
    { key: "description", label: "Description", type: "textarea", hideInTable: true },
    { key: "priority", label: "Priority", type: "select", options: ["P0", "P1", "P2"], badgeMap: { P0: "critical", P1: "info", P2: "muted" } },
    { key: "effort", label: "Effort", type: "select", options: ["S", "M", "L", "XL"] },
    { key: "status", label: "Status", type: "select", options: ["proposed", "planned", "in_progress", "shipped", "rejected"], optionLabels: { proposed: "Proposed", planned: "Planned", in_progress: "In Progress", shipped: "Shipped", rejected: "Rejected" }, badgeMap: { proposed: "muted", planned: "info", in_progress: "info", shipped: "growth", rejected: "critical" } },
  ],
  mock: [
    { id: "f2", name: "Bank auto-import", description: "Plaid-style auto transactions.", priority: "P0", effort: "XL", status: "planned" },
    { id: "f1", name: "Savings goals & streaks", description: "Gamified goals for D30 retention.", priority: "P1", effort: "L", status: "in_progress" },
  ],
};

export const bugsEntity: EntityConfig = {
  table: "bugs",
  title: "Bugs",
  singular: "bug",
  orderBy: "reported_at",
  fields: [
    { key: "title", label: "Issue", type: "text", required: true },
    { key: "description", label: "Description", type: "textarea", hideInTable: true },
    { key: "severity", label: "Severity", type: "select", options: ["low", "medium", "high", "critical"], badgeMap: { low: "muted", medium: "info", high: "critical", critical: "critical" } },
    { key: "reported_by", label: "Reported by", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["open", "in_progress", "resolved", "wont_fix"], optionLabels: { open: "Open", in_progress: "In Progress", resolved: "Resolved", wont_fix: "Won't fix" }, badgeMap: { open: "critical", in_progress: "info", resolved: "growth", wont_fix: "muted" } },
    { key: "resolution_notes", label: "Resolution", type: "textarea", hideInTable: true },
  ],
  mock: [
    { id: "b1", title: "Budget sync fails on iOS 18.2", description: "", severity: "critical", reported_by: "6 users", status: "in_progress", resolution_notes: "" },
    { id: "b3", title: "Negative balance shows positive", description: "", severity: "high", reported_by: "ava.chen", status: "open", resolution_notes: "" },
  ],
};

export const feedbackEntity: EntityConfig = {
  table: "feedback",
  title: "Feedback",
  singular: "item",
  fields: [
    { key: "user_label", label: "User", type: "text" },
    { key: "text", label: "Feedback", type: "textarea", required: true },
    { key: "category", label: "Category", type: "select", options: ["bug", "feature_request", "ux", "pricing", "praise", "other"], optionLabels: { bug: "Bug", feature_request: "Feature", ux: "UX", pricing: "Pricing", praise: "Praise", other: "Other" } },
    { key: "sentiment", label: "Sentiment", type: "select", options: ["positive", "neutral", "negative"], badgeMap: { positive: "growth", neutral: "info", negative: "critical" } },
    { key: "priority", label: "Priority", type: "select", options: ["low", "medium", "high"], badgeMap: { low: "muted", medium: "info", high: "critical" } },
    { key: "status", label: "Status", type: "select", options: ["new", "triaged", "linked", "closed"], badgeMap: { new: "info", triaged: "secondary", linked: "growth", closed: "muted" } },
  ],
  mock: [
    { id: "fb6", user_label: "ethan.ross", text: "Connecting my bank took too many steps and I gave up.", category: "ux", sentiment: "negative", priority: "high", status: "new" },
    { id: "fb3", user_label: "mia.patel", text: "The streak idea would keep me coming back daily!", category: "feature_request", sentiment: "positive", priority: "medium", status: "linked" },
  ],
};

export const supportTicketsEntity: EntityConfig = {
  table: "support_tickets",
  title: "Support tickets",
  singular: "ticket",
  orderBy: "created_at",
  description: "filed from the website /support form",
  fields: [
    { key: "name", label: "Name", type: "text", placeholder: "Ava Chen" },
    { key: "email", label: "Email", type: "text", required: true, placeholder: "ava@uni.edu" },
    { key: "type", label: "Type", type: "select", options: ["complaint", "bug", "billing", "account", "question", "other"], optionLabels: { complaint: "Complaint", bug: "Bug", billing: "Billing", account: "Account", question: "Question", other: "Other" }, badgeMap: { complaint: "critical", bug: "critical", billing: "info", account: "secondary", question: "info", other: "muted" } },
    { key: "subject", label: "Subject", type: "text", placeholder: "Short summary" },
    { key: "message", label: "Message", type: "textarea", required: true },
    { key: "priority", label: "Priority", type: "select", options: ["low", "medium", "high", "urgent"], badgeMap: { low: "muted", medium: "info", high: "critical", urgent: "critical" } },
    { key: "status", label: "Status", type: "select", options: ["new", "in_progress", "waiting", "resolved", "closed"], optionLabels: { new: "New", in_progress: "In Progress", waiting: "Waiting", resolved: "Resolved", closed: "Closed" }, badgeMap: { new: "info", in_progress: "secondary", waiting: "muted", resolved: "growth", closed: "muted" } },
  ],
  mock: [
    { id: "st1", name: "Noah Kim", email: "noah.kim@uni.edu", type: "billing", subject: "Charged twice for Pro", message: "I was billed $9.99 twice on the same day — can you refund the duplicate?", priority: "high", status: "new" },
    { id: "st2", name: "Mia Patel", email: "mia.patel@uni.edu", type: "bug", subject: "Bank sync stuck", message: "Connecting my bank spins forever on the last step.", priority: "medium", status: "in_progress" },
  ],
};

export const waitlistEntity: EntityConfig = {
  table: "waitlist",
  title: "Waitlist signups",
  singular: "signup",
  orderBy: "created_at",
  description: "collected from the website's Join the Waitlist popup",
  fields: [
    { key: "email", label: "Email", type: "text", required: true, placeholder: "ava@uni.edu" },
    { key: "source", label: "Source", type: "select", options: ["website", "referral", "manual", "other"], optionLabels: { website: "Website", referral: "Referral", manual: "Manual", other: "Other" }, badgeMap: { website: "info", referral: "growth", manual: "muted", other: "muted" } },
    { key: "created_at", label: "Signed up", type: "date" },
  ],
  mock: [
    { id: "wl1", email: "ava.chen@uni.edu", source: "website", created_at: "2026-07-08" },
    { id: "wl2", email: "liam.ortiz@uni.edu", source: "website", created_at: "2026-07-07" },
    { id: "wl3", email: "noah.kim@uni.edu", source: "referral", created_at: "2026-07-05" },
  ],
};

export const toolsEntity: EntityConfig = {
  table: "tools",
  title: "Tools",
  singular: "tool",
  fields: [
    { key: "name", label: "Tool", type: "text", required: true },
    { key: "category", label: "Category", type: "select", options: ["design", "dev", "analytics", "marketing", "ops", "ai", "finance"] },
    { key: "cost_month", label: "Cost/mo", type: "currency" },
    { key: "billing_date", label: "Billing", type: "date" },
    { key: "owner", label: "Owner", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["active", "trial", "canceled"], badgeMap: { active: "growth", trial: "info", canceled: "muted" } },
  ],
  mock: [
    { id: "to1", name: "Notion", category: "ops", cost_month: 96, billing_date: "2026-07-03", owner: "Karim", status: "active" },
    { id: "to6", name: "Anthropic API", category: "ai", cost_month: 180, billing_date: "2026-07-10", owner: "Sam", status: "active" },
  ],
};

export const onboardingStepsEntity: EntityConfig = {
  table: "onboarding_steps",
  title: "Onboarding steps",
  singular: "step",
  orderBy: "step_order",
  ascending: true,
  description: "feeds the funnel",
  fields: [
    { key: "step_order", label: "Order", type: "number" },
    { key: "name", label: "Step", type: "text", required: true },
    { key: "completion_rate", label: "Completion %", type: "number" },
  ],
  mock: [
    { id: "os1", step_order: 1, name: "Sign up", completion_rate: 100 },
    { id: "os4", step_order: 4, name: "Connect bank", completion_rate: 42 },
  ],
};

export const metricsDailyEntity: EntityConfig = {
  table: "metrics_daily",
  title: "Daily metrics",
  singular: "day",
  orderBy: "snapshot_date",
  ascending: true,
  pk: "snapshot_date",
  description: "feeds users / DAU / MAU / stickiness",
  fields: [
    { key: "snapshot_date", label: "Date", type: "date", required: true },
    { key: "total_users", label: "Total users", type: "number" },
    { key: "new_users", label: "New users", type: "number" },
    { key: "dau", label: "DAU", type: "number" },
    { key: "mau", label: "MAU", type: "number" },
    { key: "activated_users", label: "Activated", type: "number", hideInTable: true },
    { key: "churned_users", label: "Churned", type: "number", hideInTable: true },
  ],
  mock: [],
};

export const kpiWeeklyEntity: EntityConfig = {
  table: "kpi_weekly",
  title: "Weekly KPIs",
  singular: "week",
  orderBy: "week_start",
  ascending: true,
  pk: "week_start",
  description: "feeds retention / churn / activation / NPS",
  fields: [
    { key: "week_start", label: "Week start", type: "date", required: true },
    { key: "user_growth_rate", label: "Growth %", type: "number" },
    { key: "activation_rate", label: "Activation %", type: "number" },
    { key: "retention_d1", label: "D1 %", type: "number", hideInTable: true },
    { key: "retention_d7", label: "D7 %", type: "number" },
    { key: "retention_d30", label: "D30 %", type: "number", hideInTable: true },
    { key: "monthly_churn", label: "Churn %", type: "number" },
    { key: "nps", label: "NPS", type: "number" },
    { key: "support_resolution_rate", label: "Support %", type: "number", hideInTable: true },
  ],
  mock: [],
};

export const alertsEntity: EntityConfig = {
  table: "alerts",
  title: "Alerts",
  singular: "alert",
  fields: [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "message", label: "Message", type: "textarea", hideInTable: true },
    { key: "component", label: "Component", type: "select", options: ["content", "financial", "development", "operations", "users"], badgeMap: { content: "info", financial: "growth", development: "info", operations: "muted", users: "secondary" } },
    { key: "severity", label: "Severity", type: "select", options: ["critical", "warning", "info"], badgeMap: { critical: "critical", warning: "info", info: "muted" } },
    { key: "status", label: "Status", type: "select", options: ["open", "acknowledged", "resolved"], badgeMap: { open: "critical", acknowledged: "info", resolved: "growth" } },
  ],
  mock: [
    { id: "a1", title: "Day-30 retention dipped below 8.5%", message: "Mar cohort trailing.", component: "users", severity: "critical", status: "open" },
    { id: "a4", title: "P0 bug: budget sync fails on iOS 18.2", message: "6 users in 24h.", component: "development", severity: "critical", status: "open" },
  ],
};
