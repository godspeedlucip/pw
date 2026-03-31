export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/text-utils";

async function ensureUniqueSlug(base: string, excludeId?: string) {
  const raw = toSlug(base) || "project-detail";
  let slug = raw;
  let count = 1;

  while (true) {
    const existed = await prisma.blogPost.findUnique({ where: { slug } });
    if (!existed || (excludeId && existed.id === excludeId)) {
      return slug;
    }
    slug = `${raw}-${count}`;
    count += 1;
  }
}

async function ensureUniqueDetailSlug(base: string, excludeId?: string) {
  const raw = toSlug(base) || "project-detail";
  let slug = raw;
  let count = 1;

  while (true) {
    const existed = await prisma.projectEntry.findFirst({ where: { detailSlug: slug } });
    if (!existed || (excludeId && existed.id === excludeId)) {
      return slug;
    }
    slug = `${raw}-${count}`;
    count += 1;
  }
}

async function syncProjectBlog(body: any) {
  const markdownContent = String(body.markdownContent || "").trim();
  if (!markdownContent) {
    return { detailBlogPostId: null as string | null, detailBlogSlug: null as string | null };
  }

  const title = String(body.title || "Project Detail").trim();
  const preferredBlogSlug = String(body.detailBlogSlug || `project-${title}`);
  const targetSlug = await ensureUniqueSlug(preferredBlogSlug, body.detailBlogPostId || undefined);

  if (body.detailBlogPostId) {
    const updated = await prisma.blogPost.update({
      where: { id: body.detailBlogPostId },
      data: {
        title: `${title} - Project Detail`,
        slug: targetSlug,
        excerpt: body.starResult || body.context || null,
        category: "Projects",
        coverImageUrl: body.coverImageUrl || null,
        tags: Array.isArray(body.techStack) ? body.techStack : [],
        markdownBody: markdownContent,
        latexEnabled: true,
        readingTimeMinutes: Math.max(1, Math.ceil(markdownContent.length / 900)),
        status: "published",
        publishedAt: new Date()
      }
    });

    return { detailBlogPostId: updated.id, detailBlogSlug: updated.slug };
  }

  const created = await prisma.blogPost.create({
    data: {
      title: `${title} - Project Detail`,
      slug: targetSlug,
      excerpt: body.starResult || body.context || null,
      category: "Projects",
      coverImageUrl: body.coverImageUrl || null,
      tags: Array.isArray(body.techStack) ? body.techStack : [],
      markdownBody: markdownContent,
      latexEnabled: true,
      readingTimeMinutes: Math.max(1, Math.ceil(markdownContent.length / 900)),
      status: "published",
      publishedAt: new Date()
    }
  });

  return { detailBlogPostId: created.id, detailBlogSlug: created.slug };
}

export async function GET() {
  const data = await prisma.projectEntry.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const blog = await syncProjectBlog(body);
  const detailSlug = await ensureUniqueDetailSlug(String(body.detailSlug || body.title || "project-detail"));

  const created = await prisma.projectEntry.create({
    data: {
      title: body.title,
      context: body.context || null,
      starSituation: body.starSituation || null,
      starTask: body.starTask || null,
      starAction: body.starAction || null,
      starResult: body.starResult || null,
      markdownContent: body.markdownContent || null,
      detailSlug,
      detailBlogPostId: blog.detailBlogPostId,
      detailBlogSlug: blog.detailBlogSlug,
      techStack: Array.isArray(body.techStack) ? body.techStack : [],
      githubUrl: body.githubUrl || null,
      demoUrl: body.demoUrl || null,
      externalUrl: body.externalUrl || null,
      coverImageUrl: body.coverImageUrl || null,
      isFeatured: Boolean(body.isFeatured),
      sortOrder: Number(body.sortOrder || 0)
    }
  });

  return NextResponse.json(created, { status: 201 });
}