export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.researchEntry.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const created = await prisma.researchEntry.create({
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

  return NextResponse.json(created, { status: 201 });
}
