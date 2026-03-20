"use client";

import { FormEvent, useEffect, useState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";

type SettingsForm = {
  siteTitle: string;
  heroSlogan: string;
  heroImageUrl: string;
  resumeFileUrl: string;
  homeDescriptions: string[];
  portfolioIntroText: string;
  blogIntroText: string;
  lifeIntroText: string;
  footerIntroText: string;
  currentStatus: string;
  contactEmail: string;
  linkedinUrl: string;
  githubUrl: string;
  footerCtaText: string;
  seoDefaultDescription: string;
};

const initialForm: SettingsForm = {
  siteTitle: "个人网站",
  heroSlogan: "",
  heroImageUrl: "",
  resumeFileUrl: "",
  homeDescriptions: ["", ""],
  portfolioIntroText: "",
  blogIntroText: "",
  lifeIntroText: "",
  footerIntroText: "",
  currentStatus: "",
  contactEmail: "",
  linkedinUrl: "",
  githubUrl: "",
  footerCtaText: "",
  seoDefaultDescription: ""
};

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item : "")).map((item) => item.trim());
}

export default function SiteSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(initialForm);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/site-settings", { cache: "no-store" });
      const data = await res.json();
      if (!data) return;

      const list = normalizeStringArray(data.homeDescriptions);
      const fallbackList = [data.homeIntroText || "", data.homeValueText || ""].filter(Boolean);

      setForm({
        siteTitle: data.siteTitle || "个人网站",
        heroSlogan: data.heroSlogan || "",
        heroImageUrl: data.heroImageUrl || "",
        resumeFileUrl: data.resumeFileUrl || "",
        homeDescriptions: (list.length ? list : fallbackList).length ? (list.length ? list : fallbackList) : [""],
        portfolioIntroText: data.portfolioIntroText || "",
        blogIntroText: data.blogIntroText || "",
        lifeIntroText: data.lifeIntroText || "",
        footerIntroText: data.footerIntroText || "",
        currentStatus: data.currentStatus || "",
        contactEmail: data.contactEmail || "",
        linkedinUrl: data.linkedinUrl || "",
        githubUrl: data.githubUrl || "",
        footerCtaText: data.footerCtaText || "",
        seoDefaultDescription: data.seoDefaultDescription || ""
      });
    }

    void load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const cleanedDescriptions = form.homeDescriptions.map((item) => item.trim()).filter(Boolean);

    await fetch("/api/admin/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        homeDescriptions: cleanedDescriptions,
        homeIntroText: cleanedDescriptions[0] || "",
        homeValueText: cleanedDescriptions[1] || ""
      })
    });

    alert("保存成功");
  }

  function updateHomeDescription(index: number, value: string) {
    setForm((prev) => ({
      ...prev,
      homeDescriptions: prev.homeDescriptions.map((item, i) => (i === index ? value : item))
    }));
  }

  function addHomeDescription() {
    setForm((prev) => ({ ...prev, homeDescriptions: [...prev.homeDescriptions, ""] }));
  }

  function removeHomeDescription(index: number) {
    setForm((prev) => ({
      ...prev,
      homeDescriptions: prev.homeDescriptions.filter((_, i) => i !== index)
    }));
  }

  return (
    <section className="card p-6">
      <h2 className="text-2xl font-semibold text-slate-900">站点设置</h2>
      <p className="mt-2 text-sm text-slate-600">首页、成就页、博客页、生活页等描述文字都可以在这里编辑。</p>

      <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="站点标题" value={form.siteTitle} onChange={(e) => setForm({ ...form, siteTitle: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="首页 Slogan" value={form.heroSlogan} onChange={(e) => setForm({ ...form, heroSlogan: e.target.value })} />

        <ImageUploadField label="首页头像/证件照" value={form.heroImageUrl} onChange={(value) => setForm({ ...form, heroImageUrl: value })} accept="image/*" />
        <ImageUploadField label="简历文件（支持 PDF/图片）" value={form.resumeFileUrl} onChange={(value) => setForm({ ...form, resumeFileUrl: value })} accept="image/*,application/pdf" />

        <div className="rounded-lg border border-slate-200 p-4 md:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium text-slate-900">首页描述（可增删）</h3>
            <button type="button" className="rounded-lg border border-slate-300 px-3 py-1 text-sm" onClick={addHomeDescription}>新增描述</button>
          </div>
          <div className="space-y-2">
            {form.homeDescriptions.map((item, index) => (
              <div key={`home-desc-${index}`} className="flex items-start gap-2">
                <textarea
                  className="min-h-20 flex-1 rounded-lg border border-slate-300 px-3 py-2"
                  placeholder={`首页描述 ${index + 1}`}
                  value={item}
                  onChange={(e) => updateHomeDescription(index, e.target.value)}
                />
                <button
                  type="button"
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
                  onClick={() => removeHomeDescription(index)}
                  disabled={form.homeDescriptions.length <= 1}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>

        <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" placeholder="成就页描述" value={form.portfolioIntroText} onChange={(e) => setForm({ ...form, portfolioIntroText: e.target.value })} />
        <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" placeholder="博客页描述" value={form.blogIntroText} onChange={(e) => setForm({ ...form, blogIntroText: e.target.value })} />
        <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" placeholder="生活页描述" value={form.lifeIntroText} onChange={(e) => setForm({ ...form, lifeIntroText: e.target.value })} />
        <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" placeholder="页脚描述" value={form.footerIntroText} onChange={(e) => setForm({ ...form, footerIntroText: e.target.value })} />

        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="当前状态" value={form.currentStatus} onChange={(e) => setForm({ ...form, currentStatus: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="联系邮箱" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="LinkedIn 链接" value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="GitHub 链接" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
        <input className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" placeholder="页脚按钮文案" value={form.footerCtaText} onChange={(e) => setForm({ ...form, footerCtaText: e.target.value })} />
        <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" placeholder="SEO 默认描述" value={form.seoDefaultDescription} onChange={(e) => setForm({ ...form, seoDefaultDescription: e.target.value })} />

        <button className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 md:col-span-2" type="submit">保存设置</button>
      </form>
    </section>
  );
}
