// import { NextRequest, NextResponse } from "next/server";

// function clearAuthCookies(res: NextResponse) {
//   const common = {
//     path: "/",
//     maxAge: 0,
//     expires: new Date(0),
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax" as const,
//   };
//   res.cookies.set("laravel-session", "", { ...common, httpOnly: true });
//   res.cookies.set("XSRF-TOKEN", "", { ...common, httpOnly: false });
//   res.cookies.set("userData", "", { ...common, httpOnly: false });
// }

// export function proxy(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // 1. Patterns to ignore
//   if (
//     req.headers.has("next-action") ||
//     pathname.startsWith("/api") ||
//     pathname.startsWith("/_next") ||
//     pathname.includes(".") ||
//     pathname === "/favicon.ico"
//   ) {
//     return NextResponse.next();
//   }

//   // 2. Determine auth status
//   const sessionCookie = 
//     req.cookies.get("laravel-session") || 
//     req.cookies.get("laravel_session");
//   const xsrfCookie = req.cookies.get("XSRF-TOKEN");
//   const isAuthenticated = Boolean(sessionCookie?.value) && Boolean(xsrfCookie?.value);

//   // 3. Login page handling
//   if (pathname === "/login") {
//     const isAuthRequired = req.nextUrl.searchParams.has("auth");

//     // If authenticated, we usually redirect to dashboard.
//     // However, if 'auth' is present, it means the session failed, so we must stay at login.
//     if (isAuthenticated && !isAuthRequired) {
//       return NextResponse.redirect(new URL("/dashboard", req.url));
//     }

//     // If we're at login because of an auth error, ensure we clear the invalid cookies
//     if (isAuthRequired) {
//         const res = NextResponse.next();
//         clearAuthCookies(res);
//         return res;
//     }

//     return NextResponse.next();
//   }

//   // 4. Root redirect
//   if (pathname === "/") {
//     return NextResponse.redirect(new URL("/dashboard", req.url));
//   }

//   // 5. Protected Routes (PAUSED for integration)
//   /*
//   if (!isAuthenticated) {
//     const loginUrl = new URL("/login", req.url);
//     loginUrl.searchParams.set("auth", "required");
//     const res = NextResponse.redirect(loginUrl);
//     clearAuthCookies(res);
//     return res;
//   }
//   */

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/((?!api|backend|_next/static|_next/image|favicon.ico).*)",
//   ],
// };

// export default proxy;


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * SINGLE REDIRECT AUTHORITY
 * ---------------------------------------------------------------------------
 * Only this middleware may perform auth-based redirects.
 * No other layer (server actions, axios, layouts) may redirect.
 * ---------------------------------------------------------------------------
 */

const AUTH_COOKIE_NAMES = [
  "laravel-session",
  "XSRF-TOKEN",
  "userData",
  "authToken",
];

const LOGIN_PATHS = ["/"];

const isLoginOrPublic = (pathname: string): boolean =>
  LOGIN_PATHS.includes(pathname);

/**
 * Clears auth cookies and redirects to login page.
 * Clears both host-scoped and root-domain cookies so no session ghosting.
 */
function clearAuthCookiesAndRedirectToLogin(
  request: NextRequest,
  reason?: "session-expired"
): NextResponse {
  const target = reason ? `/?reason=${reason}` : "/";
  const url = new URL(target, request.url);

  const response = NextResponse.redirect(url);

  const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
  const domains: (string | undefined)[] = [undefined, COOKIE_DOMAIN];

  domains.forEach((domain) => {
    AUTH_COOKIE_NAMES.forEach((name) => {
      response.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
        ...(domain ? { domain } : {}),
      });
    });
  });

  return response;
}

/**
 * Returns a single fmg-session and XSRF-TOKEN for the /admin/me request.
 * Deduplicates by name (last wins) so Laravel never receives duplicate Cookie.
 */
function getSingleSessionCookiesForAdminMe(request: NextRequest): {
  laravelSession: string | undefined;
  xsrfToken: string | undefined;
} {
  const map = new Map<string, string>();
  for (const c of request.cookies.getAll()) {
    map.set(c.name, c.value);
  }
  return {
    laravelSession: map.get("laravel-session"),
    xsrfToken: map.get("XSRF-TOKEN"),
  };
}

/**
 * Validates admin session with backend.
 * Uses getSingleSessionCookiesForAdminMe so only one session is sent (no duplicate).
 */
async function validateAdminSession(
  request: NextRequest
): Promise<NextResponse | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_LARAVEL_API_URL ||
    process.env.LARAVEL_API_URL ||
    "";

  if (!baseUrl) return null;

  const apiUrl = `${baseUrl.replace(/\/$/, "")}/api/auth/profile`;
  const { laravelSession, xsrfToken } = getSingleSessionCookiesForAdminMe(request);

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (laravelSession) {
    headers["Cookie"] = `laravel-session=${laravelSession}`;
  }
  if (xsrfToken) {
    headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfToken);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(apiUrl, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.status === 401 || res.status === 419) {
      return clearAuthCookiesAndRedirectToLogin(
        request,
        "session-expired"
      );
    }

    // Never redirect on 500 to avoid logout loops
    return null;
  } catch {
    // Network error → allow request instead of forcing logout
    return null;
  }
}

/** Paths we never run auth logic for (APIs, normalize-session, etc.). */
const isApiOrAuthPath = (pathname: string): boolean =>
  pathname.startsWith("/api/");

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Do not block login/logout APIs or normalize-session
  if (isApiOrAuthPath(pathname)) {
    return NextResponse.next();
  }

  const hasSession = !!request.cookies.get("laravel-session");
  const hasXsrf = !!request.cookies.get("XSRF-TOKEN");
  const isAuthenticated = hasSession || hasXsrf;

  // =========================
  // LOGIN / PUBLIC ROUTE
  // =========================
  if (isLoginOrPublic(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
    }
    return NextResponse.next();
  }

  // =========================
  // PROTECTED ROUTES
  // =========================
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const sessionRedirect = await validateAdminSession(request);
  if (sessionRedirect) return sessionRedirect;

  return NextResponse.next();
}

/**
 * Protected routes
 */
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    
  ],
};