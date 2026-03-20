export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeStatus(value: unknown) {
  return String(value || "draft").trim().toLowerCase();
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const status = normalizeStatus(body.status);
  const publishedAt = status === "published" ? body.publishedAt || new Date().toISOString() : null;

  const updated = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || null,
      category: body.category || null,
      coverImageUrl: body.coverImageUrl || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      markdownBody: body.markdownBody || "",
      latexEnabled: body.latexEnabled !== false,
      readingTimeMinutes: Number(body.readingTimeMinutes || 1),
      status,
      publishedAt: publishedAt ? new Date(publishedAt) : null
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
