"use client";

import { FormEvent, useEffect, useState } from "react";
import { csvToList, listToCsv } from "@/lib/crud-helpers";
import { ImageUploadField } from "@/components/admin/image-upload-field";

type BlogItem = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  tags: string[];
  status: string;
};

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImageUrl: string;
  tagsCsv: string;
  markdownBody: string;
  latexEnabled: boolean;
  readingTimeMinutes: number;
  status: string;
};

const initialForm: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  category: "",
  coverImageUrl: "",
  tagsCsv: "",
  markdownBody: "",
  latexEnabled: true,
  readingTimeMinutes: 5,
  status: "draft"
};

export default function BlogAdminPage() {
  const [items, setItems] = useState<BlogItem[]>([]);
  const [form, setForm] = useState<BlogForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadItems() {
    const res = await fetch("/api/admin/blog", { cache: "no-store" });
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => {
    void loadItems();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      category: form.category,
      coverImageUrl: form.coverImageUrl,
      tags: csvToList(form.tagsCsv),
      markdownBody: form.markdownBody,
      latexEnabled: form.latexEnabled,
      readingTimeMinutes: Number(form.readingTimeMinutes),
      status: form.status,
      publishedAt: form.status === "published" ? new Date().toISOString() : null
    };

    const url = editingId ? `/api/admin/blog/${editingId}` : "/api/admin/blog";
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
    const res = await fetch(`/api/admin/blog/${id}`);
    const item = await res.json();
    setEditingId(id);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || "",
      category: item.category || "",
      coverImageUrl: item.coverImageUrl || "",
      tagsCsv: listToCsv(item.tags),
      markdownBody: item.markdownBody || "",
      latexEnabled: Boolean(item.latexEnabled),
      readingTimeMinutes: Number(item.readingTimeMinutes || 5),
      status: item.status || "draft"
    });
  }

  async function onDelete(id: string) {
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    if (editingId === id) {
      setEditingId(null);
      setForm(initialForm);
    }
    await loadItems();
  }

  return (
    <section className="card p-6">
      <h2 className="text-2xl font-semibold text-slate-900">博客管理</h2>
      <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Slug（英文路径）" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="分类" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="标签（逗号分隔）" value={form.tagsCsv} onChange={(e) => setForm({ ...form, tagsCsv: e.target.value })} />

        <ImageUploadField label="封面图" value={form.coverImageUrl} onChange={(value) => setForm({ ...form, coverImageUrl: value })} />

        <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" placeholder="摘要" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        <textarea className="min-h-40 rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" placeholder="Markdown 正文" value={form.markdownBody} onChange={(e) => setForm({ ...form, markdownBody: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2" type="number" min={1} value={form.readingTimeMinutes} onChange={(e) => setForm({ ...form, readingTimeMinutes: Number(e.target.value) })} />
        <select className="rounded-lg border border-slate-300 px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="draft">草稿</option>
          <option value="published">发布</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
          <input type="checkbox" checked={form.latexEnabled} onChange={(e) => setForm({ ...form, latexEnabled: e.target.checked })} /> 启用 LaTeX 公式渲染
        </label>
        <div className="flex gap-2 md:col-span-2">
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700" type="submit">{editingId ? "更新" : "新建"}</button>
          {editingId ? <button type="button" className="rounded-lg border border-slate-300 px-4 py-2" onClick={() => { setEditingId(null); setForm(initialForm); }}>取消编辑</button> : null}
        </div>
      </form>

      <div className="mt-8 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">/{item.slug} - {item.status}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-sm text-brand-700" onClick={() => onEdit(item.id)}>编辑</button>
                <button className="text-sm text-red-600" onClick={() => onDelete(item.id)}>删除</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
