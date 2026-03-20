import { PublicShell } from "@/components/public-shell";
import { getPortfolioData, getSiteSettings } from "@/lib/public-data";
import { asStringArray } from "@/lib/public-format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const [settings, data] = await Promise.all([getSiteSettings(), getPortfolioData()]);

  return (
    <PublicShell
      siteTitle={settings.siteTitle}
      contactEmail={settings.contactEmail}
      linkedinUrl={settings.linkedinUrl}
      githubUrl={settings.githubUrl}
      footerCtaText={settings.footerCtaText}
      footerIntroText={settings.footerIntroText}
    >
      <section className="card surface p-6 md:p-8">
        <p className="chip">专业成就</p>
        <h1 className="hero-title mt-3">科研与项目沉淀</h1>
        <p className="mt-3 max-w-3xl text-slate-600">{settings.portfolioIntroText}</p>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">科研经历</h2>
          <span className="text-sm text-slate-500">共 {data.research.length} 条</span>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {data.research.map((item) => (
            <article key={item.id} className="card hover-rise overflow-hidden p-0">
              {item.visualSrc ? (
                <div className="image-frame h-40 rounded-none border-0 border-b border-slate-200">
                  <img src={item.visualSrc} alt={item.title} loading="lazy" />
                </div>
              ) : null}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.role}</p>
                <p className="mt-3 text-sm text-slate-700">{item.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {asStringArray(item.keywords).map((keyword) => <span key={keyword} className="tag">{keyword}</span>)}
                </div>
                <p className="mt-3 text-xs text-slate-500">工具：{asStringArray(item.tools).join(", ") || "暂无"}</p>
                <Link href={`/portfolio/research/${item.id}`} className="mt-4 inline-flex nav-pill bg-white text-brand-700">查看详情</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">项目经历</h2>
          <span className="text-sm text-slate-500">共 {data.projects.length} 条</span>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {data.projects.map((item) => (
            <article key={item.id} className="card hover-rise overflow-hidden p-0">
              <div className="image-frame h-48 rounded-none border-0 border-b border-slate-200">
                <img src={item.coverImageSrc || ""} alt={item.title} loading="lazy" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-700">{item.context}</p>
                <p className="mt-2 text-sm text-slate-700">结果：{item.starResult || "暂无"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {asStringArray(item.techStack).map((tech) => <span key={tech} className="tag">{tech}</span>)}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={item.detailBlogSlug ? `/blog/${item.detailBlogSlug}` : `/portfolio/projects/${item.id}`} className="inline-flex nav-pill bg-white text-brand-700">
                    {item.detailBlogSlug ? "查看关联博客" : "查看详情"}
                  </Link>
                  {item.githubUrl ? <a className="inline-flex nav-pill bg-white" href={item.githubUrl}>GitHub</a> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
