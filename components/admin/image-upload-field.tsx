"use client";

import { useRef, useState } from "react";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accept?: string;
};

function isImageUrl(url: string) {
  const lower = url.toLowerCase();
  return /(\.png|\.jpg|\.jpeg|\.webp|\.gif|\.bmp|\.svg)$/.test(lower) || lower.includes("image");
}

export function ImageUploadField({ label, value, onChange, accept = "image/*" }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFileChange(file: File | null) {
    if (!file) return;

    setError("");
    setUploading(true);

    const data = new FormData();
    data.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: data
    });

    setUploading(false);

    if (!res.ok) {
      const result = await res.json().catch(() => ({ error: "上传失败" }));
      setError(result.error || "上传失败");
      return;
    }

    const result = await res.json();
    onChange(result.fileUrl || "");
  }

  return (
    <div className="space-y-2 md:col-span-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-[280px] flex-1 rounded-lg border border-slate-300 px-3 py-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="可直接粘贴 URL，或使用右侧上传"
        />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            void onFileChange(file);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "上传中..." : "上传文件"}
        </button>
      </div>
      {value ? (
        isImageUrl(value) ? (
          <img src={value} alt="预览图" className="h-28 rounded-lg border border-slate-200 object-cover" loading="lazy" />
        ) : (
          <a href={value} className="text-sm text-brand-700 underline" target="_blank" rel="noreferrer">
            查看已上传文件
          </a>
        )
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
