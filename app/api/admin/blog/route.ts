export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeStatus(value: unknown) {
  return String(value || "draft").trim().toLowerCase();
}

export async function GET() {
  const data = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const status = normalizeStatus(body.status);
  const publishedAt = status === "published" ? body.publishedAt || new Date().toISOString() : null;

  const created = await prisma.blogPost.create({
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

  return NextResponse.json(created, { status: 201 });
}
