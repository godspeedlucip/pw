"use client";

import { FormEvent, useEffect, useState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";

type MediaItem = {
  id: string;
  fileName: string;
  fileUrl: string;
  assetType: string;
};

type MediaForm = {
  fileName: string;
  fileUrl: string;
  assetType: string;
  mimeType: string;
  fileSize: string;
  usageCount: string;
};

const initialForm: MediaForm = {
  fileName: "",
  fileUrl: "",
  assetType: "project",
  mimeType: "",
  fileSize: "",
  usageCount: "0"
};

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [form, setForm] = useState<MediaForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadItems() {
    const res = await fetch("/api/admin/media", { cache: "no-store" });
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => {
    void loadItems();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      fileName: form.fileName,
      fileUrl: form.fileUrl,
      assetType: form.assetType,
      mimeType: form.mimeType,
      fileSize: form.fileSize ? Number(form.fileSize) : null,
      usageCount: Number(form.usageCount || 0)
    };

    const url = editingId ? `/api/admin/media/${editingId}` : "/api/admin/media";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setEditingId(null);
    setForm(initialForm);
    await loadItems();
  }

  async function onEdit(id: string) {
    const res = await fetch(`/api/admin/media/${id}`);
    const item = await res.json();
    setEditingId(id);
    setForm({
      fileName: item.fileName,
      fileUrl: item.fileUrl,
      assetType: item.assetType,
      mimeType: item.mimeType || "",
      fileSize: item.fileSize ? String(item.fileSize) : "",
      usageCount: String(item.usageCount || 0)
    });
  }

  async function onDelete(id: string) {
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    await loadItems();
  }

  return (
    <section className="card p-6">
      <h2 className="text-2xl font-semibold text-slate-900">媒体库管理</h2>
      <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="文件名" value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })} required />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="资源类型（project/life/avatar 等）" value={form.assetType} onChange={(e) => setForm({ ...form, assetType: e.target.value })} />

        <ImageUploadField
          label="文件地址"
          value={form.fileUrl}
          onChange={(value) => {
            const defaultName = value.split("/").pop() || "";
            setForm({ ...form, fileUrl: value, fileName: form.fileName || defaultName, mimeType: form.mimeType || "image/*" });
          }}
          accept="image/*,application/pdf"
        />

        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="MIME 类型" value={form.mimeType} onChange={(e) => setForm({ ...form, mimeType: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="文件大小（字节）" value={form.fileSize} onChange={(e) => setForm({ ...form, fileSize: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="使用次数" value={form.usageCount} onChange={(e) => setForm({ ...form, usageCount: e.target.value })} />

        <div className="flex gap-2 md:col-span-2">
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700" type="submit">{editingId ? "更新" : "新建"}</button>
          {editingId ? <button type="button" className="rounded-lg border border-slate-300 px-4 py-2" onClick={() => { setEditingId(null); setForm(initialForm); }}>取消编辑</button> : null}
        </div>
      </form>

      <div className="mt-8 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900">{item.fileName}</h3>
                <p className="text-sm text-slate-600">{item.assetType}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-sm text-brand-700" onClick={() => onEdit(item.id)}>编辑</button>
                <button className="text-sm text-red-600" onClick={() => onDelete(item.id)}>删除</button>
              </div>
            </div>
          </article>
        ))}
        {!items.length && <p className="text-sm text-slate-500">暂无媒体数据</p>}
      </div>
    </section>
  );
}
