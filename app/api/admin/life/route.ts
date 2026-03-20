export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const record = await prisma.lifeContent.findFirst({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(record);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const existing = await prisma.lifeContent.findFirst();

  const data = {
    aboutIntro: body.aboutIntro || null,
    galleryImages: Array.isArray(body.galleryImages) ? body.galleryImages : [],
    readingList: Array.isArray(body.readingList) ? body.readingList : [],
    footprints: Array.isArray(body.footprints) ? body.footprints : [],
    skills: Array.isArray(body.skills) ? body.skills : [],
    lifeSections: Array.isArray(body.lifeSections) ? body.lifeSections : [],
    resumeFileUrl: body.resumeFileUrl || null
  };

  if (existing) {
    const updated = await prisma.lifeContent.update({ where: { id: existing.id }, data });
    return NextResponse.json(updated);
  }

  const created = await prisma.lifeContent.create({ data });
  return NextResponse.json(created, { status: 201 });
}
