import { NextResponse } from "next/server";
import { authConfig, signAuthToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "").trim();
  const password = String(body.password || "");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signAuthToken({ email });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(authConfig.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: authConfig.maxAge
  });

  return response;
}
