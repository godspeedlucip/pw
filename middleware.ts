import { NextRequest, NextResponse } from "next/server";
import { authConfig, verifyAuthToken } from "@/lib/auth";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/api/admin/auth/login"]);

function isAdminPath(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function isHttpsEnforced() {
  return process.env.FORCE_HTTPS === "true";
}

function shouldForceHttps(req: NextRequest) {
  if (!isProduction()) return false;
  if (!isHttpsEnforced()) return false;
  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto !== "https";
  }
  return req.nextUrl.protocol !== "https:";
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  if (isProduction() && isHttpsEnforced()) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}

function unauthorizedApiResponse() {
  return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
}

function redirectToLogin(req: NextRequest) {
  return withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", req.url)));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (shouldForceHttps(req)) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.protocol = "https:";
    return withSecurityHeaders(NextResponse.redirect(redirectUrl, 308));
  }

  if (!isAdminPath(pathname)) {
    return withSecurityHeaders(NextResponse.next());
  }

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    const token = req.cookies.get(authConfig.cookieName)?.value;
    if (pathname === "/admin/login" && token) {
      try {
        await verifyAuthToken(token);
        return withSecurityHeaders(NextResponse.redirect(new URL("/admin", req.url)));
      } catch {
        return withSecurityHeaders(NextResponse.next());
      }
    }

    return withSecurityHeaders(NextResponse.next());
  }

  const token = req.cookies.get(authConfig.cookieName)?.value;
  if (!token) {
    if (pathname.startsWith("/api/admin")) {
      return unauthorizedApiResponse();
    }

    return redirectToLogin(req);
  }

  try {
    await verifyAuthToken(token);
    return withSecurityHeaders(NextResponse.next());
  } catch {
    if (pathname.startsWith("/api/admin")) {
      return unauthorizedApiResponse();
    }

    const response = NextResponse.redirect(new URL("/admin/login", req.url));
    response.cookies.delete(authConfig.cookieName);
    return withSecurityHeaders(response);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

