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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.researchEntry.findUnique({ where: { id: params.id } });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const existed = await prisma.researchEntry.findUnique({ where: { id: params.id } });
  if (!existed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const detailSlug = await ensureUniqueDetailSlug(String(body.detailSlug || existed.detailSlug || body.title || "research-detail"), params.id);

  const updated = await prisma.researchEntry.update({
    where: { id: params.id },
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
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.researchEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}