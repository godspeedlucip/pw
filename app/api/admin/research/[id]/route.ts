export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.researchEntry.findUnique({ where: { id: params.id } });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.researchEntry.update({
    where: { id: params.id },
    data: {
      title: body.title,
      role: body.role || null,
      dateRange: body.dateRange || null,
      summary: body.summary || null,
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
