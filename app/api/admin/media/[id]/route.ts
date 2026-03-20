export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeMedia(item: {
  id: string;
  fileName: string;
  fileUrl: string;
  assetType: string;
  mimeType: string | null;
  fileSize: bigint | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...item,
    fileSize: item.fileSize ? item.fileSize.toString() : null
  };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.mediaAsset.findUnique({ where: { id: params.id } });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(serializeMedia(item));
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.mediaAsset.update({
    where: { id: params.id },
    data: {
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      assetType: body.assetType,
      mimeType: body.mimeType || null,
      fileSize: body.fileSize ? BigInt(body.fileSize) : null,
      usageCount: Number(body.usageCount || 0)
    }
  });
  return NextResponse.json(serializeMedia(updated));
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.mediaAsset.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}


