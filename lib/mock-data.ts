// ============================================================================
// Mock data layer for BudgetIQ OS.
// Everything is generated deterministically (fixed-seed PRNG) so server and
// client render identical values — no hydration mismatches with NumberTicker.
// Swap these exports for Supabase queries when the backend is wired.
// ============================================================================

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic, gently trending series for sparklines. */
function series(
  seed: number,
  length: number,
  start: number,
  driftPct: number,
  vol: number,
): number[] {
  const rand = mulberry32(seed);
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < length; i++) {
    const drift = (start * driftPct) / 100 / length;
    v = Math.max(0, v + drift + (rand() - 0.5) * vol * start);
    out.push(Math.round(v * 100) / 100);
  }
  return out;
}

export type Trend = "up" | "down" | "neutral";

export interface Kpi {
  id: string;
  label: string;
  value: number;
  /** display format */
  format: "number" | "currency" | "percent" | "ratio" | "x" | "months";
  decimals?: number;
  /** week-over-week delta, percentage points or % change */
  delta: number;
  /** semantic direction of the delta for coloring */
  trend: Trend;
  spark: number[];
  target?: string;
  hint?: string;
  /** true when this is a positive-is-green metric; false when neutral=blue */
  positive?: boolean;
}

export const SPARK_LEN = 14;
export const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ---------------------------------------------------------------------------
// MAIN DASHBOARD — user growth metrics
// ---------------------------------------------------------------------------
export const userKpis: Kpi[] = [
  {
    id: "total_users", label: "Total users", value: 12480, format: "number",
    delta: 6.4, trend: "up", positive: true, spark: series(1, SPARK_LEN, 11200, 11, 0.01),
    hint: "Registered accounts",
  },
  {
    id: "dau", label: "DAU", value: 2980, format: "number",
    delta: 4.1, trend: "up", positive: true, spark: series(2, SPARK_LEN, 2700, 10, 0.03),
    hint: "Daily active users",
  },
  {
    id: "mau", label: "MAU", value: 9120, format: "number",
    delta: 5.2, trend: "up", positive: true, spark: series(3, SPARK_LEN, 8400, 9, 0.02),
    hint: "Monthly active users",
  },
  {
    id: "stickiness", label: "Stickiness", value: 32.7, format: "percent", decimals: 1,
    delta: 1.8, trend: "up", positive: true, spark: series(4, SPARK_LEN, 30, 9, 0.02),
    target: "Target 25%+", hint: "DAU ÷ MAU",
  },
  {
    id: "ret_d1", label: "Day-1 retention", value: 34.2, format: "percent", decimals: 1,
    delta: 1.1, trend: "up", positive: true, spark: series(5, SPARK_LEN, 32, 7, 0.02),
    target: "Target 30%+",
  },
  {
    id: "ret_d7", label: "Day-7 retention", value: 16.8, format: "percent", decimals: 1,
    delta: 0.6, trend: "up", positive: true, spark: series(6, SPARK_LEN, 15, 9, 0.03),
    target: "Target 15%+",
  },
  {
    id: "ret_d30", label: "Day-30 retention", value: 8.4, format: "percent", decimals: 1,
    delta: -0.4, trend: "down", positive: true, spark: series(7, SPARK_LEN, 9, -6, 0.04),
    target: "Target 7–10%+",
  },
  {
    id: "churn", label: "Monthly churn", value: 4.3, format: "percent", decimals: 1,
    delta: -0.5, trend: "up", positive: true, spark: series(8, SPARK_LEN, 5, -12, 0.03),
    target: "Target <5%", hint: "Lower is better",
  },
  {
    id: "activation", label: "Activation rate", value: 47.5, format: "percent", decimals: 1,
    delta: 2.3, trend: "up", positive: true, spark: series(9, SPARK_LEN, 43, 10, 0.02),
    hint: "Completed first budget",
  },
];

// ---------------------------------------------------------------------------
// MAIN DASHBOARD — financial snapshot
// ---------------------------------------------------------------------------
export const financialKpis: Kpi[] = [
  {
    id: "mrr", label: "MRR", value: 8240, format: "currency",
    delta: 7.9, trend: "up", positive: true, spark: series(11, SPARK_LEN, 7100, 16, 0.02),
  },
  {
    id: "arr", label: "ARR", value: 98880, format: "currency",
    delta: 7.9, trend: "up", positive: true, spark: series(12, SPARK_LEN, 85000, 16, 0.02),
  },
  {
    id: "ltv", label: "LTV", value: 138, format: "currency",
    delta: 3.4, trend: "up", positive: true, spark: series(13, SPARK_LEN, 128, 8, 0.02),
    hint: "ARPU ÷ churn",
  },
  {
    id: "cac", label: "CAC", value: 41, format: "currency",
    delta: -4.2, trend: "up", positive: true, spark: series(14, SPARK_LEN, 47, -12, 0.03),
    hint: "Lower is better",
  },
  {
    id: "ltv_cac", label: "LTV : CAC", value: 3.4, format: "ratio", decimals: 1,
    delta: 5.1, trend: "up", positive: true, spark: series(15, SPARK_LEN, 2.9, 16, 0.03),
    target: "Target 3:1+",
  },
  {
    id: "cac_payback", label: "CAC payback", value: 4.1, format: "months", decimals: 1,
    delta: -6.0, trend: "up", positive: true, spark: series(16, SPARK_LEN, 4.8, -12, 0.03),
    hint: "Months",
  },
  {
    id: "nrr", label: "NRR", value: 104.5, format: "percent", decimals: 1,
    delta: 1.2, trend: "up", positive: true, spark: series(17, SPARK_LEN, 101, 4, 0.01),
    hint: "Net revenue retention",
  },
  {
    id: "arpu", label: "ARPU", value: 5.94, format: "currency", decimals: 2,
    delta: 1.6, trend: "up", positive: true, spark: series(18, SPARK_LEN, 5.6, 6, 0.01),
  },
];

// ---------------------------------------------------------------------------
// ALERTS FEED
// ---------------------------------------------------------------------------
export interface Alert {
  id: string;
  component: "content" | "financial" | "development" | "operations" | "users";
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  at: string; // ISO
}

const now = Date.now();
const ago = (mins: number) => new Date(now - mins * 60000).toISOString();

export const alerts: Alert[] = [
  { id: "a1", component: "users", severity: "critical", title: "Day-30 retention dipped below 8.5%", message: "Mar cohort trailing prior month by 0.4pp — investigate week-4 drop-off.", at: ago(38) },
  { id: "a2", component: "operations", severity: "warning", title: "Notion renews in 4 days", message: "$96/mo team plan auto-renews Jul 3. Confirm seat count.", at: ago(120) },
  { id: "a3", component: "content", severity: "warning", title: "Reel engagement dropped 22% WoW", message: "‘3 money traps’ format underperforming vs. 4-wk average.", at: ago(190) },
  { id: "a4", component: "development", severity: "critical", title: "P0 bug: budget sync fails on iOS 18.2", message: "Reported by 6 users in the last 24h. No resolution yet.", at: ago(260) },
  { id: "a5", component: "financial", severity: "info", title: "MRR crossed $8.2K", message: "Up 7.9% WoW — strongest week since launch.", at: ago(420) },
  { id: "a6", component: "operations", severity: "warning", title: "Onboarding step 3 drop-off at 41%", message: "‘Connect bank’ remains the funnel’s weakest step.", at: ago(540) },
];

// ---------------------------------------------------------------------------
// MAIN DASHBOARD — revenue vs cost trend (monthly)
// ---------------------------------------------------------------------------
export const revenueTrend = months.slice(0, 12).map((m, i) => {
  const rev = series(40, 12, 3200, 160, 0.04)[i];
  const cost = series(41, 12, 4100, 30, 0.05)[i];
  return { month: m, revenue: Math.round(rev), costs: Math.round(cost), profit: Math.round(rev - cost) };
});

// ---------------------------------------------------------------------------
// CONTENT & MARKETING
// ---------------------------------------------------------------------------
export type PostFormat = "Reel" | "Carousel" | "Story" | "Static";
export type PostStatus = "draft" | "scheduled" | "published" | "archived";

export interface Post {
  id: string;
  title: string;
  format: PostFormat;
  status: PostStatus;
  platform: string;
  avatar: string;
  hook: string;
  publishDate: string;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  engagementRate: number;
}

function engRate(p: Omit<Post, "engagementRate">) {
  return p.reach > 0
    ? Math.round(((p.likes + p.comments + p.saves + p.shares) / p.reach) * 1000) / 10
    : 0;
}

const rawPosts: Omit<Post, "engagementRate">[] = [
  { id: "p1", title: "3 money traps every student falls for", format: "Reel", status: "published", platform: "Instagram", avatar: "Maya the Mentor", hook: "You're losing $200/mo without noticing", publishDate: "2026-06-26", reach: 48200, impressions: 61300, likes: 3120, comments: 284, saves: 1890, shares: 642 },
  { id: "p2", title: "How I budget on $0 income", format: "Carousel", status: "published", platform: "Instagram", avatar: "Maya the Mentor", hook: "Broke? This still works.", publishDate: "2026-06-24", reach: 31400, impressions: 39800, likes: 2010, comments: 156, saves: 2240, shares: 410 },
  { id: "p3", title: "The 50/30/20 rule is lying to you", format: "Reel", status: "published", platform: "TikTok", avatar: "Dex the Analyst", hook: "Your favorite budget rule is broken", publishDate: "2026-06-22", reach: 72500, impressions: 91200, likes: 5410, comments: 612, saves: 3120, shares: 1240 },
  { id: "p4", title: "Track every coffee for 30 days", format: "Story", status: "published", platform: "Instagram", avatar: "Nova the Hype", hook: "I tracked every coffee. The total hurt.", publishDate: "2026-06-21", reach: 18900, impressions: 22100, likes: 940, comments: 88, saves: 410, shares: 96 },
  { id: "p5", title: "Student loan myths, debunked", format: "Carousel", status: "scheduled", platform: "Instagram", avatar: "Dex the Analyst", hook: "Everything you heard about loans is wrong", publishDate: "2026-07-01", reach: 0, impressions: 0, likes: 0, comments: 0, saves: 0, shares: 0 },
  { id: "p6", title: "POV: your first paycheck", format: "Reel", status: "draft", platform: "Instagram", avatar: "Nova the Hype", hook: "First paycheck? Don't do this.", publishDate: "2026-07-03", reach: 0, impressions: 0, likes: 0, comments: 0, saves: 0, shares: 0 },
  { id: "p7", title: "Why you're always broke by Tuesday", format: "Reel", status: "published", platform: "Instagram", avatar: "Maya the Mentor", hook: "Broke by Tuesday? Here's why.", publishDate: "2026-06-18", reach: 39600, impressions: 50200, likes: 2740, comments: 210, saves: 1510, shares: 520 },
  { id: "p8", title: "The no-spend weekend challenge", format: "Static", status: "archived", platform: "Instagram", avatar: "Nova the Hype", hook: "48 hours, $0 spent. Could you?", publishDate: "2026-05-30", reach: 12400, impressions: 14900, likes: 610, comments: 44, saves: 280, shares: 60 },
];
export const posts: Post[] = rawPosts.map((p) => ({ ...p, engagementRate: engRate(p) }));

export interface Avatar {
  id: string;
  name: string;
  bio: string;
  visualStyle: string;
  tone: string;
  pillars: string[];
  posts: number;
  avgEngagement: number;
}
export const avatars: Avatar[] = [
  { id: "av1", name: "Maya the Mentor", bio: "Calm, relatable finance big-sister for first-year students.", visualStyle: "Warm tones, handwritten overlays", tone: "Supportive, plainspoken", pillars: ["Budgeting basics", "Mindset", "Q&A"], posts: 34, avgEngagement: 9.8 },
  { id: "av2", name: "Dex the Analyst", bio: "Data-driven myth-buster who breaks down the numbers.", visualStyle: "Dark UI, charts, neon accents", tone: "Sharp, contrarian", pillars: ["Myth-busting", "Comparisons", "Deep dives"], posts: 28, avgEngagement: 11.2 },
  { id: "av3", name: "Nova the Hype", bio: "High-energy challenges and POV skits for Gen-Z reach.", visualStyle: "Bold text, fast cuts, trends", tone: "Playful, urgent", pillars: ["Challenges", "POV", "Trends"], posts: 22, avgEngagement: 7.4 },
];

export type HookCategory = "curiosity" | "pain_point" | "number_based" | "question" | "bold_claim";
export interface Hook {
  id: string;
  text: string;
  format: PostFormat;
  category: HookCategory;
  dateTested: string;
  score: number;
}
export const hooks: Hook[] = [
  { id: "h1", text: "You're losing $200/mo without noticing", format: "Reel", category: "pain_point", dateTested: "2026-06-26", score: 9.4 },
  { id: "h2", text: "Your favorite budget rule is broken", format: "Reel", category: "bold_claim", dateTested: "2026-06-22", score: 9.1 },
  { id: "h3", text: "Broke? This still works.", format: "Carousel", category: "curiosity", dateTested: "2026-06-24", score: 8.6 },
  { id: "h4", text: "What if you never checked your balance again?", format: "Reel", category: "question", dateTested: "2026-06-15", score: 7.2 },
  { id: "h5", text: "3 money traps every student falls for", format: "Reel", category: "number_based", dateTested: "2026-06-26", score: 8.9 },
  { id: "h6", text: "First paycheck? Don't do this.", format: "Reel", category: "pain_point", dateTested: "2026-06-10", score: 6.8 },
];
export const hookAbTest = {
  name: "Pain-point vs. Number hook — Reel",
  a: { text: hooks[0].text, score: 9.4 },
  b: { text: hooks[4].text, score: 8.9 },
  metric: "Engagement rate",
  status: "complete" as const,
};

export interface VideoReview {
  id: string;
  title: string;
  rating: number;
  hookStrength: number;
  pacing: number;
  cta: number;
  caption: number;
  suggestions: string;
  reviewedAt: string;
}
export const videoReviews: VideoReview[] = [
  { id: "v1", title: "3 money traps (final cut)", rating: 8.6, hookStrength: 9, pacing: 8, cta: 7, caption: 9, suggestions: "Tighten the first 0.8s — lead with the dollar figure. CTA card lingers too long.", reviewedAt: "2026-06-26" },
  { id: "v2", title: "50/30/20 debunk v2", rating: 9.1, hookStrength: 9, pacing: 9, cta: 9, caption: 8, suggestions: "Strong. Add captions in first frame for sound-off viewers.", reviewedAt: "2026-06-22" },
  { id: "v3", title: "No-spend weekend recap", rating: 5.4, hookStrength: 5, pacing: 6, cta: 4, caption: 6, suggestions: "Hook is weak — open on the result, not the setup. No clear CTA.", reviewedAt: "2026-06-19" },
  { id: "v4", title: "First paycheck POV", rating: 7.2, hookStrength: 7, pacing: 8, cta: 6, caption: 7, suggestions: "Good energy. Trim mid-section by ~3s, add a save-prompt CTA.", reviewedAt: "2026-06-12" },
];

export interface ScrapedAccount {
  id: string;
  account: string;
  postType: string;
  hook: string;
  estReach: number;
  engagementRate: number;
  notes: string;
}
export const scrapedAccounts: ScrapedAccount[] = [
  { id: "s1", account: "@thebudgetbabe", postType: "Reel", hook: "I saved $5k in 6 months as a student", estReach: 120000, engagementRate: 12.4, notes: "Personal-result hooks crushing it" },
  { id: "s2", account: "@financebro", postType: "Carousel", hook: "The 5 accounts every 20-something needs", estReach: 88000, engagementRate: 9.1, notes: "List format, clean design system" },
  { id: "s3", account: "@moneywithmel", postType: "Reel", hook: "Stop budgeting. Do this instead.", estReach: 210000, engagementRate: 14.8, notes: "Contrarian hook — top performer this week" },
  { id: "s4", account: "@studentcents", postType: "Story", hook: "Day in the life on a $0 budget", estReach: 34000, engagementRate: 6.2, notes: "Relatable but low reach" },
];

// ---------------------------------------------------------------------------
// FINANCIAL
// ---------------------------------------------------------------------------
export interface Payment {
  id: string;
  payer: string;
  plan: "Plus" | "Pro";
  amount: number;
  date: string;
  method: string;
  status: "Paid" | "Pending" | "Refunded" | "Failed";
}
export const payments: Payment[] = [
  { id: "r1", payer: "ava.chen@uni.edu", plan: "Pro", amount: 9.99, date: "2026-06-28", method: "Card", status: "Paid" },
  { id: "r2", payer: "liam.ortiz@uni.edu", plan: "Plus", amount: 4.99, date: "2026-06-28", method: "Apple Pay", status: "Paid" },
  { id: "r3", payer: "noah.kim@uni.edu", plan: "Pro", amount: 9.99, date: "2026-06-27", method: "Card", status: "Paid" },
  { id: "r4", payer: "mia.patel@uni.edu", plan: "Plus", amount: 4.99, date: "2026-06-27", method: "Google Pay", status: "Pending" },
  { id: "r5", payer: "ethan.ross@uni.edu", plan: "Pro", amount: 9.99, date: "2026-06-26", method: "Card", status: "Paid" },
  { id: "r6", payer: "zoe.wang@uni.edu", plan: "Plus", amount: 4.99, date: "2026-06-25", method: "PayPal", status: "Refunded" },
  { id: "r7", payer: "leo.santos@uni.edu", plan: "Pro", amount: 9.99, date: "2026-06-25", method: "Card", status: "Paid" },
  { id: "r8", payer: "isla.brown@uni.edu", plan: "Plus", amount: 4.99, date: "2026-06-24", method: "Card", status: "Failed" },
];

export interface Expense {
  id: string;
  category: string;
  vendor: string;
  amount: number;
  cycle: "Monthly" | "Annual" | "One-time";
  date: string;
  notes: string;
}
export const expenses: Expense[] = [
  { id: "e1", category: "Infra", vendor: "Supabase", amount: 25, cycle: "Monthly", date: "2026-06-05", notes: "Pro plan" },
  { id: "e2", category: "Infra", vendor: "Vercel", amount: 20, cycle: "Monthly", date: "2026-06-05", notes: "Pro seat" },
  { id: "e3", category: "Tools", vendor: "Notion", amount: 96, cycle: "Monthly", date: "2026-06-03", notes: "Team, 6 seats" },
  { id: "e4", category: "Marketing", vendor: "Meta Ads", amount: 1450, cycle: "Monthly", date: "2026-06-12", notes: "Reel boosts + retargeting" },
  { id: "e5", category: "Contractors", vendor: "Editor (Reels)", amount: 1200, cycle: "Monthly", date: "2026-06-15", notes: "20 videos/mo" },
  { id: "e6", category: "AI", vendor: "Anthropic API", amount: 180, cycle: "Monthly", date: "2026-06-10", notes: "Video review + content agents" },
  { id: "e7", category: "Tools", vendor: "Figma", amount: 45, cycle: "Monthly", date: "2026-06-08", notes: "3 editors" },
  { id: "e8", category: "Legal", vendor: "Stripe Atlas", amount: 500, cycle: "One-time", date: "2026-06-01", notes: "Entity + tax setup" },
];

export interface Subscription {
  id: string;
  payer: string;
  plan: "Plus" | "Pro";
  price: number;
  billingDate: string;
  renewal: "active" | "canceled" | "past_due" | "at_risk";
}
export const subscriptions: Subscription[] = [
  { id: "su1", payer: "ava.chen@uni.edu", plan: "Pro", price: 9.99, billingDate: "2026-07-01", renewal: "active" },
  { id: "su2", payer: "liam.ortiz@uni.edu", plan: "Plus", price: 4.99, billingDate: "2026-07-02", renewal: "active" },
  { id: "su3", payer: "mia.patel@uni.edu", plan: "Plus", price: 4.99, billingDate: "2026-07-02", renewal: "past_due" },
  { id: "su4", payer: "noah.kim@uni.edu", plan: "Pro", price: 9.99, billingDate: "2026-07-03", renewal: "at_risk" },
  { id: "su5", payer: "ethan.ross@uni.edu", plan: "Pro", price: 9.99, billingDate: "2026-07-04", renewal: "active" },
  { id: "su6", payer: "zoe.wang@uni.edu", plan: "Plus", price: 4.99, billingDate: "2026-07-06", renewal: "canceled" },
];

export const saasMetrics = {
  arpu: 5.94,
  ltv: 138,
  cac: 41,
  ltvCac: 3.4,
  cacPayback: 4.1,
  nrr: 104.5,
  grossMargin: 86,
  burn: 3716,
  cashOnHand: 42500,
  runwayMonths: 11.4,
};

export const pnlTrend = months.slice(0, 12).map((m, i) => {
  const revenue = Math.round(series(50, 12, 2400, 220, 0.04)[i]);
  const costs = Math.round(series(51, 12, 3800, 18, 0.04)[i]);
  return { month: m, revenue, costs, net: revenue - costs };
});

export const costByCategory = [
  { category: "Marketing", amount: 1450 },
  { category: "Contractors", amount: 1200 },
  { category: "AI", amount: 180 },
  { category: "Tools", amount: 141 },
  { category: "Infra", amount: 45 },
  { category: "Legal", amount: 500 },
];

export const mrrTrend = months.slice(0, 12).map((m, i) => ({
  month: m,
  mrr: Math.round(series(52, 12, 1800, 360, 0.03)[i]),
}));

// ---------------------------------------------------------------------------
// DEVELOPMENT
// ---------------------------------------------------------------------------
export type KanbanColumn = "backlog" | "todo" | "in_progress" | "review" | "done";
export interface DevTask {
  id: string;
  title: string;
  description: string;
  status: KanbanColumn;
  priority: "P0" | "P1" | "P2";
  assignee: string;
  due: string;
  origin: "notion" | "manual";
}
export const devTasks: DevTask[] = [
  { id: "t1", title: "Fix budget sync on iOS 18.2", description: "Sync silently fails for some users post-update.", status: "in_progress", priority: "P0", assignee: "Sam", due: "2026-06-30", origin: "manual" },
  { id: "t2", title: "Onboarding: simplify bank-connect step", description: "Step 3 drop-off at 41%. Add skip + manual entry.", status: "todo", priority: "P1", assignee: "Priya", due: "2026-07-04", origin: "notion" },
  { id: "t3", title: "Weekly email digest", description: "Auto-send spend summary every Sunday.", status: "backlog", priority: "P2", assignee: "Sam", due: "2026-07-12", origin: "notion" },
  { id: "t4", title: "Dark mode polish", description: "Contrast pass on charts + empty states.", status: "review", priority: "P2", assignee: "Priya", due: "2026-06-29", origin: "manual" },
  { id: "t5", title: "Streaks & savings goals v1", description: "Gamified savings streaks to lift D30 retention.", status: "todo", priority: "P1", assignee: "Sam", due: "2026-07-08", origin: "notion" },
  { id: "t6", title: "Migrate auth to Supabase", description: "Move from custom JWT to Supabase Auth.", status: "done", priority: "P1", assignee: "Sam", due: "2026-06-20", origin: "notion" },
  { id: "t7", title: "Add spending categories API", description: "Endpoint for custom category CRUD.", status: "in_progress", priority: "P1", assignee: "Priya", due: "2026-07-02", origin: "manual" },
  { id: "t8", title: "Crash on empty transaction list", description: "Null guard for first-run users.", status: "done", priority: "P0", assignee: "Sam", due: "2026-06-24", origin: "manual" },
  { id: "t9", title: "Referral program scaffolding", description: "Invite links + reward ledger.", status: "backlog", priority: "P2", assignee: "Priya", due: "2026-07-20", origin: "notion" },
];

export interface Feature {
  id: string;
  name: string;
  description: string;
  priority: "P0" | "P1" | "P2";
  effort: "S" | "M" | "L" | "XL";
  status: "proposed" | "planned" | "in_progress" | "shipped" | "rejected";
  linkedFeedback: number;
}
export const features: Feature[] = [
  { id: "f1", name: "Savings goals & streaks", description: "Gamified goals to drive habit + D30 retention.", priority: "P1", effort: "L", status: "in_progress", linkedFeedback: 14 },
  { id: "f2", name: "Bank auto-import", description: "Plaid-style connection for auto transactions.", priority: "P0", effort: "XL", status: "planned", linkedFeedback: 22 },
  { id: "f3", name: "Shared budgets (roommates)", description: "Split rent/utilities across a household.", priority: "P2", effort: "L", status: "proposed", linkedFeedback: 9 },
  { id: "f4", name: "Weekly spend digest email", description: "Sunday recap with category breakdown.", priority: "P1", effort: "M", status: "planned", linkedFeedback: 6 },
  { id: "f5", name: "Apple Wallet widget", description: "At-a-glance balance on home screen.", priority: "P2", effort: "M", status: "proposed", linkedFeedback: 4 },
];

export interface Bug {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  reportedBy: string;
  status: "open" | "in_progress" | "resolved" | "wont_fix";
  date: string;
}
export const bugs: Bug[] = [
  { id: "b1", title: "Budget sync fails on iOS 18.2", severity: "critical", reportedBy: "6 users", status: "in_progress", date: "2026-06-28" },
  { id: "b2", title: "Category colors reset on logout", severity: "low", reportedBy: "support", status: "open", date: "2026-06-27" },
  { id: "b3", title: "Negative balance shows positive", severity: "high", reportedBy: "ava.chen", status: "open", date: "2026-06-26" },
  { id: "b4", title: "Push notif sent twice", severity: "medium", reportedBy: "internal", status: "resolved", date: "2026-06-22" },
  { id: "b5", title: "Onboarding back-button loops", severity: "medium", reportedBy: "3 users", status: "in_progress", date: "2026-06-25" },
];

// ---------------------------------------------------------------------------
// OPERATIONS
// ---------------------------------------------------------------------------
export interface Feedback {
  id: string;
  user: string;
  text: string;
  category: "bug" | "feature_request" | "ux" | "pricing" | "praise" | "other";
  sentiment: "positive" | "neutral" | "negative";
  priority: "low" | "medium" | "high";
  status: "new" | "triaged" | "linked" | "closed";
}
export const feedback: Feedback[] = [
  { id: "fb1", user: "ava.chen", text: "Wish it auto-imported my bank transactions instead of manual entry.", category: "feature_request", sentiment: "neutral", priority: "high", status: "linked" },
  { id: "fb2", user: "liam.ortiz", text: "Sync stopped working after the iOS update. Frustrating.", category: "bug", sentiment: "negative", priority: "high", status: "triaged" },
  { id: "fb3", user: "mia.patel", text: "The streak idea would keep me coming back daily!", category: "feature_request", sentiment: "positive", priority: "medium", status: "linked" },
  { id: "fb4", user: "noah.kim", text: "Honestly the cleanest budgeting app I've used. Love the dark mode.", category: "praise", sentiment: "positive", priority: "low", status: "closed" },
  { id: "fb5", user: "zoe.wang", text: "$9.99 feels steep for a student. A cheaper tier would help.", category: "pricing", sentiment: "negative", priority: "medium", status: "new" },
  { id: "fb6", user: "ethan.ross", text: "Connecting my bank took too many steps and I gave up.", category: "ux", sentiment: "negative", priority: "high", status: "new" },
];

export const kpiWeekly = Array.from({ length: 12 }, (_, i) => {
  const w = `W${i + 1}`;
  return {
    week: w,
    growth: Math.round(series(60, 12, 3.2, 40, 0.2)[i] * 10) / 10,
    activation: Math.round(series(61, 12, 41, 14, 0.04)[i] * 10) / 10,
    retentionD7: Math.round(series(62, 12, 14.5, 14, 0.05)[i] * 10) / 10,
    churn: Math.round(series(63, 12, 5.4, -18, 0.05)[i] * 10) / 10,
    nps: Math.round(series(64, 12, 38, 24, 0.06)[i]),
    supportResolution: Math.round(series(65, 12, 88, 8, 0.02)[i] * 10) / 10,
  };
});

export interface Tool {
  id: string;
  name: string;
  category: string;
  cost: number;
  billingDate: string;
  owner: string;
  status: "active" | "trial" | "canceled";
}
export const tools: Tool[] = [
  { id: "to1", name: "Notion", category: "Ops", cost: 96, billingDate: "2026-07-03", owner: "Karim", status: "active" },
  { id: "to2", name: "Vercel", category: "Dev", cost: 20, billingDate: "2026-07-05", owner: "Sam", status: "active" },
  { id: "to3", name: "Supabase", category: "Dev", cost: 25, billingDate: "2026-07-05", owner: "Sam", status: "active" },
  { id: "to4", name: "Figma", category: "Design", cost: 45, billingDate: "2026-07-08", owner: "Priya", status: "active" },
  { id: "to5", name: "Meta Ads", category: "Marketing", cost: 1450, billingDate: "2026-07-12", owner: "Karim", status: "active" },
  { id: "to6", name: "Anthropic API", category: "AI", cost: 180, billingDate: "2026-07-10", owner: "Sam", status: "active" },
  { id: "to7", name: "Linear", category: "Dev", cost: 0, billingDate: "2026-07-14", owner: "Sam", status: "trial" },
];

export interface OnboardingStep {
  name: string;
  completion: number;
}
export const onboardingFunnel: OnboardingStep[] = [
  { name: "Sign up", completion: 100 },
  { name: "Verify email", completion: 82 },
  { name: "Set first budget", completion: 71 },
  { name: "Connect bank", completion: 42 },
  { name: "Log first expense", completion: 38 },
  { name: "Activated (7-day)", completion: 31 },
];

export const onboardingExperiment = {
  name: "Bank-connect: skip option vs. forced",
  variantA: { label: "Forced connect", completion: 42 },
  variantB: { label: "Skip + manual entry", completion: 58 },
  metric: "Step completion",
  status: "running" as const,
};

// ---------------------------------------------------------------------------
// INTEGRATIONS
// ---------------------------------------------------------------------------
export interface Integration {
  id: string;
  provider: string;
  description: string;
  status: "connected" | "disconnected";
  fields: { key: string; label: string; placeholder: string; secret?: boolean }[];
}
export const integrations: Integration[] = [
  { id: "meta", provider: "Meta / Instagram", description: "Pull post + reel performance into the CMS.", status: "disconnected", fields: [{ key: "app_id", label: "App ID", placeholder: "1234567890" }, { key: "app_secret", label: "App secret", placeholder: "••••••••", secret: true }] },
  { id: "stripe", provider: "Stripe", description: "Sync payments, subscriptions and MRR.", status: "connected", fields: [{ key: "secret_key", label: "Secret key", placeholder: "sk_live_…", secret: true }] },
  { id: "notion", provider: "Notion", description: "Import tasks for the migration board.", status: "connected", fields: [{ key: "token", label: "Integration token", placeholder: "ntn_…", secret: true }, { key: "db_id", label: "Database ID", placeholder: "a1b2c3…" }] },
  { id: "posthog", provider: "PostHog", description: "Stream product analytics for retention + funnels.", status: "disconnected", fields: [{ key: "api_key", label: "Project API key", placeholder: "phc_…", secret: true }] },
  { id: "slack", provider: "Slack", description: "Post critical alerts to a team channel.", status: "disconnected", fields: [{ key: "webhook", label: "Incoming webhook URL", placeholder: "https://hooks.slack.com/…", secret: true }] },
];
