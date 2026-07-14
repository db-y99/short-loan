import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ROUTES, isLoanSignPublicRoute } from "@/constants/routes";
import { env } from "@/config/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // API routes tự guard auth — tránh redirect HTML khi fetch
  if (pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  const isPublicRoute =
    pathname === ROUTES.LOGIN ||
    pathname.startsWith("/auth") ||
    isLoanSignPublicRoute(pathname);

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();

    url.pathname = ROUTES.LOGIN;

    return NextResponse.redirect(url);
  }

  if (user && pathname === ROUTES.LOGIN) {
    const url = request.nextUrl.clone();

    url.pathname = ROUTES.HOME;

    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
