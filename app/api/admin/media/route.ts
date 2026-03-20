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

export async function GET() {
  const data = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(data.map(serializeMedia));
}

export async function POST(req: Request) {
  const body = await req.json();
  const created = await prisma.mediaAsset.create({
    data: {
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      assetType: body.assetType,
      mimeType: body.mimeType || null,
      fileSize: body.fileSize ? BigInt(body.fileSize) : null,
      usageCount: Number(body.usageCount || 0)
    }
  });

  return NextResponse.json(serializeMedia(created), { status: 201 });
}


