import type { Applicant } from "@/components/applicants/applicants-panel";

// Human labels for the vision-answer keys stored in content_onboarding.vision_answers.
// These mirror budgetiq/lib/onboarding-questions.ts on the website — the ids are
// the contract between the two apps, so keep them in sync when a question is
// added or renamed. Unknown ids fall back to the raw key rather than vanishing.
export const VISION_QUESTION_LABELS: Record<string, string> = {
  why_budgetiq: "Why BudgetIQ, specifically?",
  what_we_change: "What do you think BudgetIQ is actually trying to change?",
  audience: "Who is our audience, and what do they actually care about?",
  self_started: "Tell us about something you built or ran when nobody asked you to.",
  first_move: "It's your first week. What are you shipping?",
  twelve_months: "Where do you want to be in 12 months, and how does this fit?",
};

// The website stores the brand question in vision_answers under these keys
// (the vision step itself was cut in Oct 2026, which left that column free and
// avoided a schema change). Must match budgetiq/app/api/content-onboarding.
export const BRAND_KEYS = {
  worked: "brands_worked_with",
  details: "brands",
} as const;

// Seeds so the panel is reviewable before Supabase is connected — same role as
// the `mock` arrays on every entity in lib/entities.ts.
export const applicantMock: Applicant[] = [
  {
    // Shape of an applicant from the trimmed /onboarding (Oct 2026): no vision
    // answers, brand question instead, retired fields left null.
    id: "ca0",
    full_name: "Maya Haddad",
    email: "maya@example.com",
    phone: "+961 70 123 456",
    age: "21",
    location: "Beirut, Lebanon",
    occupation: null,
    platforms: ["TikTok", "Instagram"],
    handles: { tiktok: "mayasaves", instagram: "maya.hd" },
    total_followers: 12400,
    avg_views: 3500,
    best_post_url: null,
    best_post_why: null,
    tools: [],
    portfolio_url: null,
    vision_answers: {
      brands_worked_with: "Yes",
      brands: "Anghami, 3 TikToks, 2023",
    },
    commitment: null,
    hunger: null,
    agreement_signature: "Maya Haddad",
    agreement_accepted_at: "2026-10-17T12:00:00Z",
    status: "new",
    notes: null,
    created_at: "2026-10-17T12:00:00Z",
  },
  {
    id: "ca1",
    full_name: "Lara Haddad",
    email: "lara.haddad@aub.edu.lb",
    phone: "+961 71 445 210",
    age: "21",
    location: "Beirut, Lebanon",
    occupation: "AUB, final-year Business",
    platforms: ["TikTok", "Instagram"],
    handles: { tiktok: "larasaves", instagram: "lara.hd" },
    total_followers: 24800,
    avg_views: 41000,
    best_post_url: "https://www.tiktok.com/@larasaves/video/1",
    best_post_why:
      "I opened on the number instead of the story. People saw '£340 gone' before they knew what the video was about, and the comments were all guesses, which pushed watch time way past the point where the algorithm usually drops you.",
    tools: ["CapCut", "Figma"],
    portfolio_url: "https://larahaddad.work",
    vision_answers: {
      why_budgetiq:
        "I have watched three friends graduate into salaries they cannot account for. Not because they are careless, but because nobody ever showed them what a normal month looks like. Every finance app I have tried assumes you already have the habit and just need a nicer chart. BudgetIQ is the first one I have seen that treats the habit itself as the product, and that is the part I actually want to work on.",
      what_we_change:
        "Money advice for our age group is either condescending or a pyramid scheme. The real gap is not information, it is that nobody makes tracking feel survivable for more than nine days. Changing that is a design and content problem far more than a finance problem.",
      audience:
        "Students and first-job people who are quietly embarrassed. They have a vague sense they are overspending and they avoid opening their banking app on Sundays. They do not want a lecture, they want permission and a system. They respond to specificity and to other people admitting numbers out loud.",
      self_started:
        "I ran a page for two years documenting what I actually spent as a student in Beirut, down to the manoushe. No brand deals, no plan. It got to 24k because I was the only person willing to post the ugly weeks. I stopped only because I ran out of my own story to tell, which is exactly why doing it for a product with a real roadmap appeals to me.",
      first_move:
        "A series called 'the first hundred dollars', one video per week where I take a real reader's first month and rebuild it live in the app. Hook is always the number they were losing without noticing. It gives us recurring format, real user stories, and a natural product demo without it feeling like an ad.",
      twelve_months:
        "I want to be running the content side of something rather than freelancing across five brands. Twelve months from now I would like to own a format that other people copy. Doing that inside a launch is worth more to me than doing it alone.",
    },
    commitment: "10–20 hrs / week",
    hunger: 9,
    agreement_signature: "Lara Haddad",
    agreement_accepted_at: "2026-07-29T14:12:00Z",
    status: "shortlisted",
    notes: "Strongest answers in the batch. Best-post reasoning shows she understands retention, not just reach.",
    created_at: "2026-07-29T14:12:00Z",
  },
  {
    id: "ca2",
    full_name: "Omar Chalhoub",
    email: "omar.chalhoub@gmail.com",
    phone: null,
    age: "23",
    location: "Dubai, UAE",
    occupation: "Freelance editor",
    platforms: ["Instagram", "YouTube"],
    handles: { instagram: "omarcuts", youtube: "@omarcuts" },
    total_followers: 6100,
    avg_views: 2400,
    best_post_url: "https://www.instagram.com/p/omarcuts1",
    best_post_why: "It was a trending audio and the edit was clean.",
    tools: ["Premiere Pro", "After Effects"],
    portfolio_url: "https://vimeo.com/omarcuts",
    vision_answers: {
      why_budgetiq: "I think fintech is a growing space and I want to work with a startup.",
      what_we_change: "Helping people budget better and save more money.",
      audience: "Young people who want to save money.",
      self_started:
        "I built an editing portfolio and posted my work consistently for a year. Most of my clients came from that page rather than from applying anywhere.",
      first_move: "I would post daily reels with good editing and trending sounds.",
      twelve_months: "Working full time as a video editor for a good company.",
    },
    commitment: "20+ hrs / week",
    hunger: 8,
    agreement_signature: "Omar Chalhoub",
    agreement_accepted_at: "2026-07-30T09:40:00Z",
    status: "reviewing",
    notes: "Real editing skill, generic answers. Worth a call to see if the thinking is there and just not written down.",
    created_at: "2026-07-30T09:40:00Z",
  },
  {
    id: "ca3",
    full_name: "Yara Nasr",
    email: "yara.nasr@lau.edu.lb",
    phone: "+961 76 902 118",
    age: "20",
    location: "Byblos, Lebanon",
    occupation: "LAU, Graphic Design",
    platforms: ["TikTok", "Instagram", "X / Twitter"],
    handles: { tiktok: "yaramakes", instagram: "yara.nsr", twitter: "yaramakes" },
    total_followers: 1900,
    avg_views: 8700,
    best_post_url: "https://www.tiktok.com/@yaramakes/video/2",
    best_post_why:
      "Small account, but that one went out to eight times my follower count because I answered a question people were already arguing about in another creator's comments. I have since built most of my posts by reading comment sections instead of trend pages.",
    tools: ["CapCut", "Photoshop", "Figma"],
    portfolio_url: "https://behance.net/yaranasr",
    vision_answers: {
      why_budgetiq:
        "Because I am the target user and I am tired of being sold to by people who clearly are not. I opened four budgeting apps last year and closed all of them within a week. If I can make the thing that finally sticks for someone like me, that is a better use of a year than another design internship.",
      what_we_change:
        "The shame. Most people our age know roughly what they should be doing and feel bad that they are not doing it, and every existing product makes that feeling worse by showing you a red number. Making the honest version feel neutral instead of punishing is the actual change.",
      audience:
        "Students who split bills over WhatsApp and never settle up, and people six months into a first job who are surprised every month. They care about not looking stupid in front of their friends far more than they care about compound interest.",
      self_started:
        "I designed and printed a zine about student money in Lebanon and gave out two hundred copies on campus. It cost me my own money and made none back, but three professors now hand it out. It taught me that distribution is the hard part, not the making.",
      first_move:
        "Comment-section mining. Week one I would find the five threads where our audience is already arguing about money and turn each into a short reply video, posted as a reply so it rides the original. Cheap to make, and it tells us what people actually respond to before we invest in a polished format.",
      twelve_months:
        "Honestly, I want to still be doing this. I am at the point where I need one thing I stuck with long enough to get good at rather than another portfolio piece.",
    },
    commitment: "10–20 hrs / week",
    hunger: 10,
    agreement_signature: "Yara Nasr",
    agreement_accepted_at: "2026-07-31T18:05:00Z",
    status: "new",
    notes: null,
    created_at: "2026-07-31T18:05:00Z",
  },
  {
    id: "ca4",
    full_name: "Rami Fakhoury",
    email: "ramifak@outlook.com",
    phone: null,
    age: "26",
    location: "Amman, Jordan",
    occupation: "Growth marketer",
    platforms: ["LinkedIn"],
    handles: {},
    total_followers: 3400,
    avg_views: 600,
    best_post_url: null,
    best_post_why: null,
    tools: ["Canva"],
    portfolio_url: null,
    vision_answers: {
      why_budgetiq: "Interested in the opportunity.",
      what_we_change: "Budgeting.",
      audience: "Everyone who uses money.",
      self_started: "N/A",
      first_move: "Whatever is needed.",
      twelve_months: "Growth.",
    },
    commitment: "Under 5 hrs / week",
    hunger: 5,
    agreement_signature: "Rami Fakhoury",
    agreement_accepted_at: "2026-08-01T11:22:00Z",
    status: "rejected",
    notes: "Six one-word answers. Exactly the filter working as intended.",
    created_at: "2026-08-01T11:22:00Z",
  },
];
