import { NextResponse } from "next/server";
import { authConfig, signAuthToken } from "@/lib/auth";
import { clearLoginFailures, checkLoginRateLimit, registerLoginFailure } from "@/lib/rate-limit";
import { verifyAdminPassword } from "@/lib/password";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isHttpsEnforced() {
  return process.env.NODE_ENV === "production" && process.env.FORCE_HTTPS === "true";
}

function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0]?.trim() || "unknown";
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "").trim();
  const password = String(body.password || "");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return NextResponse.json({ error: "Server is not configured" }, { status: 500 });
  }

  const ip = getClientIp(req);
  const rateKey = `login:${ip}:${email.toLowerCase()}`;
  const rate = checkLoginRateLimit(rateKey);

  if (rate.blocked) {
    const response = NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
    response.headers.set("Retry-After", String(rate.retryAfterSeconds));
    return response;
  }

  const emailMatches = email.toLowerCase() === adminEmail.toLowerCase();
  let passwordMatches = false;
  try {
    passwordMatches = verifyAdminPassword(password);
  } catch {
    passwordMatches = false;
  }

  if (!emailMatches || !passwordMatches) {
    registerLoginFailure(rateKey);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  clearLoginFailures(rateKey);

  const token = await signAuthToken({ email: adminEmail });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(authConfig.cookieName, token, {
    httpOnly: true,
    secure: isHttpsEnforced(),
    sameSite: "strict",
    path: "/",
    maxAge: authConfig.maxAge
  });

  return response;
}

