import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { BASE_PATH } from "@/lib/base-path";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Refreshes the Supabase session and gates the app behind auth — but only when
// Supabase is configured. Base-path aware so it works under /dashboard.
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Normalize the path (strip the base path if present) so the checks below are
  // written against clean routes like "/login".
  let path = request.nextUrl.pathname;
  if (path.startsWith(BASE_PATH)) path = path.slice(BASE_PATH.length) || "/";

  // Never gate static assets / Next internals (protects the login page's CSS/JS).
  if (
    path.startsWith("/_next") ||
    path === "/favicon.ico" ||
    /\.[a-zA-Z0-9]+$/.test(path)
  ) {
    return response;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  let mutableResponse = response;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        mutableResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          mutableResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic =
    path === "/login" || path === "/setup" || path.startsWith("/api/auth");

  if (!user && !isPublic) {
    const loginUrl = new URL(`${BASE_PATH}/login`, request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  if (user && (path === "/login" || path === "/setup")) {
    return NextResponse.redirect(new URL(BASE_PATH, request.url));
  }

  return mutableResponse;
}
