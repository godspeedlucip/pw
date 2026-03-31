export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/text-utils";

async function ensureUniqueDetailSlug(base: string, excludeId?: string) {
  const raw = toSlug(base) || "research-detail";
  let slug = raw;
  let count = 1;

  while (true) {
    const existed = await prisma.researchEntry.findFirst({ where: { detailSlug: slug } });
    if (!existed || (excludeId && existed.id === excludeId)) {
      return slug;
    }
    slug = `${raw}-${count}`;
    count += 1;
  }
}

export async function GET() {
  const data = await prisma.researchEntry.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const detailSlug = await ensureUniqueDetailSlug(String(body.detailSlug || body.title || "research-detail"));

  const created = await prisma.researchEntry.create({
    data: {
      title: body.title,
      role: body.role || null,
      dateRange: body.dateRange || null,
      summary: body.summary || null,
      detailSlug,
      publications: Array.isArray(body.publications) ? body.publications : [],
      resultVisualUrl: body.resultVisualUrl || null,
      externalUrl: body.externalUrl || null,
      tools: Array.isArray(body.tools) ? body.tools : [],
      keywords: Array.isArray(body.keywords) ? body.keywords : [],
      isFeatured: Boolean(body.isFeatured),
      sortOrder: Number(body.sortOrder || 0)
    }
  });

  return NextResponse.json(created, { status: 201 });
}