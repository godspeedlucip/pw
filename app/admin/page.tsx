"use client";

import { useEffect, useState } from "react";

type Stat = { label: string; value: string };

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stat[]>([
    { label: "科研", value: "0" },
    { label: "项目", value: "0" },
    { label: "博客", value: "0" },
    { label: "媒体", value: "0" }
  ]);

  useEffect(() => {
    async function load() {
      const [research, projects, blog, media] = await Promise.all([
        fetch("/api/admin/research", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/projects", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/blog", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/media", { cache: "no-store" }).then((r) => r.json())
      ]);

      setStats([
        { label: "科研", value: String(research.length || 0) },
        { label: "项目", value: String(projects.length || 0) },
        { label: "博客", value: String(blog.length || 0) },
        { label: "媒体", value: String(media.length || 0) }
      ]);
    }

    void load();
  }, []);

  return (
    <div className="space-y-6">
      <header className="card p-6">
        <h2 className="text-2xl font-semibold text-slate-900">后台概览</h2>
        <p className="mt-2 text-sm text-slate-600">在这里快速查看内容规模与管理入口。</p>
      </header>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <article key={item.label} className="card p-5">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
