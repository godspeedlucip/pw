"use client";

import { FormEvent, useEffect, useState } from "react";
import { csvToList, listToCsv } from "@/lib/crud-helpers";
import { ImageUploadField } from "@/components/admin/image-upload-field";

type ResearchItem = {
  id: string;
  title: string;
  role: string | null;
  dateRange: string | null;
  summary: string | null;
  detailSlug: string | null;
  keywords: string[];
  tools: string[];
  resultVisualUrl: string | null;
  externalUrl: string | null;
  isFeatured: boolean;
};

type ResearchForm = {
  title: string;
  role: string;
  dateRange: string;
  summary: string;
  detailSlug: string;
  keywordsCsv: string;
  toolsCsv: string;
  resultVisualUrl: string;
  externalUrl: string;
  isFeatured: boolean;
};

const initialForm: ResearchForm = {
  title: "",
  role: "",
  dateRange: "",
  summary: "",
  detailSlug: "",
  keywordsCsv: "",
  toolsCsv: "",
  resultVisualUrl: "",
  externalUrl: "",
  isFeatured: false
};

export default function ResearchAdminPage() {
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [form, setForm] = useState<ResearchForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadItems() {
    const res = await fetch("/api/admin/research", { cache: "no-store" });
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => {
    void loadItems();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: form.title,
      role: form.role,
      dateRange: form.dateRange,
      summary: form.summary,
      detailSlug: form.detailSlug,
      keywords: csvToList(form.keywordsCsv),
      tools: csvToList(form.toolsCsv),
      resultVisualUrl: form.resultVisualUrl,
      externalUrl: form.externalUrl,
      isFeatured: form.isFeatured
    };

    const url = editingId ? `/api/admin/research/${editingId}` : "/api/admin/research";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setForm(initialForm);
    setEditingId(null);
    setLoading(false);
    await loadItems();
  }

  function onEdit(item: ResearchItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      role: item.role || "",
      dateRange: item.dateRange || "",
      summary: item.summary || "",
      detailSlug: item.detailSlug || "",
      keywordsCsv: listToCsv(item.keywords),
      toolsCsv: listToCsv(item.tools),
      resultVisualUrl: item.resultVisualUrl || "",
      externalUrl: item.externalUrl || "",
      isFeatured: item.isFeatured
    });
  }

  async function onDelete(id: string) {
    await fetch(`/api/admin/research/${id}`, { method: "DELETE" });
    if (editingId === id) {
      setEditingId(null);
      setForm(initialForm);
    }
    await loadItems();
  }

  return (
    <section className="card p-6">
      <h2 className="text-2xl font-semibold text-slate-900">科研管理</h2>

      <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="课题标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="你的角色" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="??????? llm-paper?" value={form.detailSlug} onChange={(e) => setForm({ ...form, detailSlug: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="时间范围" value={form.dateRange} onChange={(e) => setForm({ ...form, dateRange: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="关键词（逗号分隔）" value={form.keywordsCsv} onChange={(e) => setForm({ ...form, keywordsCsv: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" placeholder="工具/设备（逗号分隔）" value={form.toolsCsv} onChange={(e) => setForm({ ...form, toolsCsv: e.target.value })} />

        <ImageUploadField label="成果图" value={form.resultVisualUrl} onChange={(value) => setForm({ ...form, resultVisualUrl: value })} />

        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="外部链接（论文/演示）" value={form.externalUrl} onChange={(e) => setForm({ ...form, externalUrl: e.target.value })} />

        <textarea className="min-h-24 rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" placeholder="摘要" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> 首页精选
        </label>

        <div className="flex gap-2 md:col-span-2">
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700" type="submit" disabled={loading}>{editingId ? "更新" : "新建"}</button>
          {editingId ? <button type="button" className="rounded-lg border border-slate-300 px-4 py-2" onClick={() => { setEditingId(null); setForm(initialForm); }}>取消编辑</button> : null}
        </div>
      </form>

      <div className="mt-8 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-900">{item.title}</h3>
              <div className="flex gap-2">
                <button className="text-sm text-brand-700" onClick={() => onEdit(item)}>编辑</button>
                <button className="text-sm text-red-600" onClick={() => onDelete(item.id)}>删除</button>
              </div>
            </div>
            <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
