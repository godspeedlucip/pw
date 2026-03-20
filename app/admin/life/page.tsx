"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { csvToList, listToCsv } from "@/lib/crud-helpers";

type LifeSection = {
  id: string;
  title: string;
  板块描述: string;
  imageUrl: string;
};

type LifeForm = {
  aboutIntro: string;
  galleryImagesCsv: string;
  readingListCsv: string;
  footprintsCsv: string;
  skillsCsv: string;
  resumeFileUrl: string;
  lifeSections: LifeSection[];
};

const initialForm: LifeForm = {
  aboutIntro: "",
  galleryImagesCsv: "",
  readingListCsv: "",
  footprintsCsv: "",
  skillsCsv: "",
  resumeFileUrl: "",
  lifeSections: []
};

function makeSection(): LifeSection {
  return {
    id: `section-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title: "",
    板块描述: "",
    imageUrl: ""
  };
}

export default function LifeAdminPage() {
  const [form, setForm] = useState<LifeForm>(initialForm);
  const [message, setMessage] = useState("");
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/life", { cache: "no-store" });
      const data = await res.json();
      if (!data) {
        return;
      }

      const sections = Array.isArray(data.lifeSections)
        ? data.lifeSections.map((item: any) => ({
            id: String(item.id || makeSection().id),
            title: String(item.title || ""),
            板块描述: String(item.板块描述 || ""),
            imageUrl: String(item.imageUrl || "")
          }))
        : [];

      setForm({
        aboutIntro: data.aboutIntro || "",
        galleryImagesCsv: listToCsv(data.galleryImages),
        readingListCsv: listToCsv(data.readingList),
        footprintsCsv: listToCsv(data.footprints),
        skillsCsv: listToCsv(data.skills),
        resumeFileUrl: data.resumeFileUrl || "",
        lifeSections: sections
      });
    }

    void load();
  }, []);

  async function uploadImage(file: File | null) {
    if (!file) return null;
    const payload = new FormData();
    payload.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: payload });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  }

  async function onUploadGallery(file: File | null) {
    const result = await uploadImage(file);
    if (!result) {
      setMessage("图片上传失败");
      return;
    }

    const list = csvToList(form.galleryImagesCsv);
    list.push(result.fileUrl);
    setForm({ ...form, galleryImagesCsv: list.join(", ") });
    setMessage("Image added to gallery list");
  }

  async function onUploadSectionImage(sectionId: string, file: File | null) {
    const result = await uploadImage(file);
    if (!result) {
      setMessage("Section 图片上传失败");
      return;
    }

    setForm({
      ...form,
      lifeSections: form.lifeSections.map((section) =>
        section.id === sectionId ? { ...section, imageUrl: result.fileUrl } : section
      )
    });
    setMessage("子板块图片上传成功");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      aboutIntro: form.aboutIntro,
      galleryImages: csvToList(form.galleryImagesCsv),
      readingList: csvToList(form.readingListCsv),
      footprints: csvToList(form.footprintsCsv),
      skills: csvToList(form.skillsCsv),
      lifeSections: form.lifeSections,
      resumeFileUrl: form.resumeFileUrl
    };

    await fetch("/api/admin/life", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setMessage("保存成功");
  }

  return (
    <section className="card p-6">
      <h2 className="text-2xl font-semibold text-slate-900">生活/关于 管理</h2>
      <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <textarea className="min-h-24 rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" placeholder="简介（可用于前台生活页描述）" value={form.aboutIntro} onChange={(e) => setForm({ ...form, aboutIntro: e.target.value })} />

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">摄影墙图片地址（逗号分隔）</label>
          <div className="flex flex-wrap gap-2">
            <input className="min-w-[280px] flex-1 rounded-lg border border-slate-300 px-3 py-2" placeholder="https://.../photo-1.png, https://.../photo-2.png" value={form.galleryImagesCsv} onChange={(e) => setForm({ ...form, galleryImagesCsv: e.target.value })} />
            <input ref={uploadInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0] || null; void onUploadGallery(file); if (uploadInputRef.current) uploadInputRef.current.value = ""; }} />
            <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={() => uploadInputRef.current?.click()}>上传到摄影墙</button>
          </div>
        </div>

        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="阅读清单（逗号分隔）" value={form.readingListCsv} onChange={(e) => setForm({ ...form, readingListCsv: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="我的足迹（逗号分隔）" value={form.footprintsCsv} onChange={(e) => setForm({ ...form, footprintsCsv: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="技能关键词（逗号分隔）" value={form.skillsCsv} onChange={(e) => setForm({ ...form, skillsCsv: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="简历地址（图片或 PDF）" value={form.resumeFileUrl} onChange={(e) => setForm({ ...form, resumeFileUrl: e.target.value })} />

        <div className="rounded-lg border border-slate-200 p-4 md:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">自定义子板块</h3>
            <button type="button" className="rounded-lg border border-slate-300 px-3 py-1 text-sm" onClick={() => setForm({ ...form, lifeSections: [...form.lifeSections, makeSection()] })}>新增子板块</button>
          </div>

          <div className="space-y-4">
            {form.lifeSections.map((section) => (
              <article key={section.id} className="rounded-lg border border-slate-200 p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="板块标题" value={section.title} onChange={(e) => setForm({ ...form, lifeSections: form.lifeSections.map((item) => item.id === section.id ? { ...item, title: e.target.value } : item) })} />
                  <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="图片地址" value={section.imageUrl} onChange={(e) => setForm({ ...form, lifeSections: form.lifeSections.map((item) => item.id === section.id ? { ...item, imageUrl: e.target.value } : item) })} />
                  <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" placeholder="板块描述" value={section.板块描述} onChange={(e) => setForm({ ...form, lifeSections: form.lifeSections.map((item) => item.id === section.id ? { ...item, 板块描述: e.target.value } : item) })} />
                </div>
                <div className="mt-2 flex gap-2">
                  <label className="rounded-lg border border-slate-300 px-3 py-1 text-sm cursor-pointer">
                    上传图片
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        void onUploadSectionImage(section.id, file);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <button type="button" className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600" onClick={() => setForm({ ...form, lifeSections: form.lifeSections.filter((item) => item.id !== section.id) })}>删除</button>
                </div>
                {section.imageUrl ? <img src={section.imageUrl} alt={section.title || "section-image"} className="mt-3 h-28 rounded-lg border border-slate-200 object-cover" loading="lazy" /> : null}
              </article>
            ))}
            {!form.lifeSections.length ? <p className="text-sm text-slate-500">No 自定义子板块 yet.</p> : null}
          </div>
        </div>

        <button className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 md:col-span-2" type="submit">保存</button>
        {message ? <p className="text-sm text-slate-600 md:col-span-2">{message}</p> : null}
      </form>
    </section>
  );
}

