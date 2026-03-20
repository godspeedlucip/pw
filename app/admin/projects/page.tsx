"use client";

import { FormEvent, useEffect, useState } from "react";
import { csvToList, listToCsv } from "@/lib/crud-helpers";
import { ImageUploadField } from "@/components/admin/image-upload-field";

type ProjectItem = {
  id: string;
  title: string;
  context: string | null;
  starSituation: string | null;
  starTask: string | null;
  starAction: string | null;
  starResult: string | null;
  markdownContent: string | null;
  detailBlogSlug: string | null;
  techStack: string[];
  githubUrl: string | null;
  demoUrl: string | null;
  externalUrl: string | null;
  coverImageUrl: string | null;
  isFeatured: boolean;
};

type ProjectForm = {
  title: string;
  context: string;
  starSituation: string;
  starTask: string;
  starAction: string;
  starResult: string;
  markdownContent: string;
  techStackCsv: string;
  githubUrl: string;
  demoUrl: string;
  externalUrl: string;
  coverImageUrl: string;
  detailBlogSlug: string;
  isFeatured: boolean;
};

const initialForm: ProjectForm = {
  title: "",
  context: "",
  starSituation: "",
  starTask: "",
  starAction: "",
  starResult: "",
  markdownContent: "",
  techStackCsv: "",
  githubUrl: "",
  demoUrl: "",
  externalUrl: "",
  coverImageUrl: "",
  detailBlogSlug: "",
  isFeatured: false
};

export default function ProjectsAdminPage() {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [form, setForm] = useState<ProjectForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadItems() {
    const res = await fetch("/api/admin/projects", { cache: "no-store" });
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
      context: form.context,
      starSituation: form.starSituation,
      starTask: form.starTask,
      starAction: form.starAction,
      starResult: form.starResult,
      markdownContent: form.markdownContent,
      detailBlogSlug: form.detailBlogSlug,
      techStack: csvToList(form.techStackCsv),
      githubUrl: form.githubUrl,
      demoUrl: form.demoUrl,
      externalUrl: form.externalUrl,
      coverImageUrl: form.coverImageUrl,
      isFeatured: form.isFeatured
    };

    const url = editingId ? `/api/admin/projects/${editingId}` : "/api/admin/projects";
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

  function onEdit(item: ProjectItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      context: item.context || "",
      starSituation: item.starSituation || "",
      starTask: item.starTask || "",
      starAction: item.starAction || "",
      starResult: item.starResult || "",
      markdownContent: item.markdownContent || "",
      detailBlogSlug: item.detailBlogSlug || "",
      techStackCsv: listToCsv(item.techStack),
      githubUrl: item.githubUrl || "",
      demoUrl: item.demoUrl || "",
      externalUrl: item.externalUrl || "",
      coverImageUrl: item.coverImageUrl || "",
      isFeatured: item.isFeatured
    });
  }

  async function onDelete(id: string) {
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (editingId === id) {
      setEditingId(null);
      setForm(initialForm);
    }
    await loadItems();
  }

  return (
    <section className="card p-6">
      <h2 className="text-2xl font-semibold text-slate-900">项目管理</h2>
      <p className="mt-2 text-sm text-slate-600">可填写 Markdown 内容，保存后可关联到博客详情页。</p>

      <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="项目名称" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="技术栈（逗号分隔）" value={form.techStackCsv} onChange={(e) => setForm({ ...form, techStackCsv: e.target.value })} />
        <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" placeholder="项目背景" value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} />
        <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2" placeholder="STAR - 情境" value={form.starSituation} onChange={(e) => setForm({ ...form, starSituation: e.target.value })} />
        <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2" placeholder="STAR - 任务" value={form.starTask} onChange={(e) => setForm({ ...form, starTask: e.target.value })} />
        <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2" placeholder="STAR - 行动" value={form.starAction} onChange={(e) => setForm({ ...form, starAction: e.target.value })} />
        <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2" placeholder="STAR - 结果" value={form.starResult} onChange={(e) => setForm({ ...form, starResult: e.target.value })} />

        <ImageUploadField label="项目封面" value={form.coverImageUrl} onChange={(value) => setForm({ ...form, coverImageUrl: value })} />

        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="GitHub 地址" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="演示地址" value={form.demoUrl} onChange={(e) => setForm({ ...form, demoUrl: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" placeholder="外部链接" value={form.externalUrl} onChange={(e) => setForm({ ...form, externalUrl: e.target.value })} />

        <textarea className="min-h-44 rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" placeholder="项目 Markdown 详情" value={form.markdownContent} onChange={(e) => setForm({ ...form, markdownContent: e.target.value })} />

        <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> 首页精选
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
                {item.detailBlogSlug ? <p className="text-xs text-slate-500">关联博客：/blog/{item.detailBlogSlug}</p> : null}
              </div>
              <div className="flex gap-2">
                <button className="text-sm text-brand-700" onClick={() => onEdit(item)}>编辑</button>
                <button className="text-sm text-red-600" onClick={() => onDelete(item.id)}>删除</button>
              </div>
            </div>
            <p className="mt-1 text-sm text-slate-600">{item.starResult}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
