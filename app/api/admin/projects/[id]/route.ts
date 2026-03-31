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

async function syncProjectBlog(project: any, body: any) {
  const markdownContent = String(body.markdownContent || "").trim();

  if (!markdownContent) {
    if (project.detailBlogPostId) {
      await prisma.blogPost.deleteMany({ where: { id: project.detailBlogPostId } });
    }
    return { detailBlogPostId: null as string | null, detailBlogSlug: null as string | null };
  }

  const title = String(body.title || "Project Detail").trim();
  const preferredBlogSlug = String(body.detailBlogSlug || `project-${title}`);
  const targetSlug = await ensureUniqueSlug(preferredBlogSlug, project.detailBlogPostId || undefined);

  if (project.detailBlogPostId) {
    const updated = await prisma.blogPost.update({
      where: { id: project.detailBlogPostId },
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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.projectEntry.findUnique({ where: { id: params.id } });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const existed = await prisma.projectEntry.findUnique({ where: { id: params.id } });

  if (!existed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const blog = await syncProjectBlog(existed, body);
  const detailSlug = await ensureUniqueDetailSlug(String(body.detailSlug || existed.detailSlug || body.title || "project-detail"), params.id);

  const updated = await prisma.projectEntry.update({
    where: { id: params.id },
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
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const existed = await prisma.projectEntry.findUnique({ where: { id: params.id } });

  if (existed?.detailBlogPostId) {
    await prisma.blogPost.deleteMany({ where: { id: existed.detailBlogPostId } });
  }

  await prisma.projectEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}