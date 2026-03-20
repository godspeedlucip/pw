export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
}

export async function GET() {
  const record = await prisma.siteSettings.findFirst({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(record);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const existing = await prisma.siteSettings.findFirst();

  const homeDescriptions = normalizeStringArray(body.homeDescriptions);

  const data = {
    siteTitle: body.siteTitle || "个人网站",
    heroSlogan: body.heroSlogan || null,
    heroImageUrl: body.heroImageUrl || null,
    resumeFileUrl: body.resumeFileUrl || null,
    homeIntroText: body.homeIntroText || homeDescriptions[0] || null,
    homeValueText: body.homeValueText || homeDescriptions[1] || null,
    homeDescriptions,
    portfolioIntroText: body.portfolioIntroText || null,
    blogIntroText: body.blogIntroText || null,
    lifeIntroText: body.lifeIntroText || null,
    footerIntroText: body.footerIntroText || null,
    currentStatus: body.currentStatus || null,
    contactEmail: body.contactEmail || null,
    linkedinUrl: body.linkedinUrl || null,
    githubUrl: body.githubUrl || null,
    footerCtaText: body.footerCtaText || null,
    seoDefaultDescription: body.seoDefaultDescription || null
  };

  if (existing) {
    const updated = await prisma.siteSettings.update({ where: { id: existing.id }, data });
    return NextResponse.json(updated);
  }

  const created = await prisma.siteSettings.create({ data });
  return NextResponse.json(created, { status: 201 });
}
