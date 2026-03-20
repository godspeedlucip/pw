import { NextRequest, NextResponse } from "next/server";
import { authConfig, verifyAuthToken } from "@/lib/auth";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/api/admin/auth/login"]);

function isAdminPath(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isAdminPath(pathname)) {
    return NextResponse.next();
  }

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    const token = req.cookies.get(authConfig.cookieName)?.value;
    if (pathname === "/admin/login" && token) {
      try {
        await verifyAuthToken(token);
        return NextResponse.redirect(new URL("/admin", req.url));
      } catch {
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }

  const token = req.cookies.get(authConfig.cookieName)?.value;
  if (!token) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    await verifyAuthToken(token);
    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = NextResponse.redirect(new URL("/admin/login", req.url));
    response.cookies.delete(authConfig.cookieName);
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
