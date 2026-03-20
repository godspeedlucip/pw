export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import OSS from "ali-oss";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const MAX_SIZE = 20 * 1024 * 1024;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function isAllowedMime(mime: string) {
  return mime.startsWith("image/") || mime === "application/pdf";
}

function getOssClient() {
  const region = process.env.OSS_REGION;
  const bucket = process.env.OSS_BUCKET;
  const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
  const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET;

  if (!region || !bucket || !accessKeyId || !accessKeySecret) {
    throw new Error("缺少 OSS 配置，请检查 OSS_REGION、OSS_BUCKET、OSS_ACCESS_KEY_ID、OSS_ACCESS_KEY_SECRET");
  }

  return new OSS({
    region,
    bucket,
    accessKeyId,
    accessKeySecret,
    endpoint: process.env.OSS_ENDPOINT || undefined,
    secure: true
  });
}

function normalizePublicUrl(rawUrl: string) {
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }
  const base = process.env.OSS_PUBLIC_URL || "";
  if (base) {
    return `${base.replace(/\/$/, "")}/${rawUrl.replace(/^\//, "")}`;
  }
  return rawUrl;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请求中未找到文件" }, { status: 400 });
    }

    if (!isAllowedMime(file.type)) {
      return NextResponse.json({ error: "仅支持图片或 PDF 文件" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "文件大小不能超过 20MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : ".png");
    const baseName = path.basename(file.name, ext);
    const safe = sanitizeFileName(baseName);
    const now = new Date();
    const folder = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const fileName = `${safe}-${randomUUID()}${ext}`;
    const objectKey = `uploads/${folder}/${fileName}`;

    const client = getOssClient();
    const result = await client.put(objectKey, buffer, {
      headers: {
        "Content-Type": file.type,
        "Cache-Control": "public, max-age=31536000"
      }
    });

    const url = normalizePublicUrl(result.url || objectKey);

    return NextResponse.json({
      fileName,
      fileUrl: url,
      mimeType: file.type,
      fileSize: file.size,
      objectKey
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "上传失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
