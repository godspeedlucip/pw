import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { getFeaturedContent, getOverviewCounts, getSiteSettings } from "@/lib/public-data";
import { asStringArray } from "@/lib/public-format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, featured, counts] = await Promise.all([
    getSiteSettings(),
    getFeaturedContent(),
    getOverviewCounts()
  ]);

  return (
    <PublicShell
      siteTitle={settings.siteTitle}
      contactEmail={settings.contactEmail}
      linkedinUrl={settings.linkedinUrl}
      githubUrl={settings.githubUrl}
      footerCtaText={settings.footerCtaText}
      footerIntroText={settings.footerIntroText}
    >
      <section className="grid gap-6 lg:grid-cols-[1fr,1.35fr]">
        <article className="card surface p-5 md:p-6 hover-rise">
          <div className="image-frame h-64">
            <img src={settings.heroImageUrl || ""} alt="头像" loading="eager" />
          </div>
          <div className="mt-4">
            <p className="chip">个人简介</p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl">{settings.siteTitle}</h1>
            <p className="mt-2 text-sm text-slate-600">{settings.heroSlogan}</p>
            {settings.currentStatus ? (
              <p className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-sm text-blue-800">
                当前状态：{settings.currentStatus}
              </p>
            ) : null}
          </div>
        </article>

        <article className="card p-6 md:p-8 hover-rise">
          <p className="chip">快速了解我</p>
          <h2 className="hero-title mt-3">后端开发、Agent开发</h2>
          {(settings.homeDescriptions || []).length ? (
            <div className="mt-4 space-y-3 max-w-2xl text-slate-600">
              {settings.homeDescriptions.map((line, idx) => (
                <p key={`home-desc-${idx}`}>{line}</p>
              ))}
            </div>
          ) : (
            <>
              <p className="mt-4 max-w-2xl text-slate-600">{settings.homeIntroText}</p>
              <p className="mt-3 max-w-2xl text-slate-600">{settings.homeValueText}</p>
            </>
          )}

          <div className="mt-5">
            {settings.resumeFileUrl ? (
              <a
                href={settings.resumeFileUrl}
                className="inline-flex items-center rounded-xl bg-brand-600 px-5 py-3 text-base font-semibold text-white shadow-lg hover:bg-brand-700"
                target="_blank"
                rel="noreferrer"
              >
                下载简历（PDF/图片）
              </a>
            ) : (
              <span className="inline-flex rounded-xl border border-slate-300 px-5 py-3 text-sm text-slate-600">
                暂未上传简历，请在后台站点设置中配置
              </span>
            )}
          </div>

          <div className="stat-grid mt-6">
            <div className="stat-card">
              <p className="text-xs text-slate-500">科研数量</p>
              <p className="value">{counts.researchCount}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-slate-500">项目数量</p>
              <p className="value">{counts.projectCount}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-slate-500">博客文章</p>
              <p className="value">{counts.blogCount}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/portfolio" className="nav-pill bg-white">查看成就</Link>
            <Link href="/blog" className="nav-pill bg-white">阅读博客</Link>
            <Link href="/life" className="nav-pill bg-white">了解我</Link>
          </div>
        </article>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <article className="card p-6 hover-rise">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">精选科研</h2>
            <Link href="/portfolio" className="text-sm text-blue-700">查看全部</Link>
          </div>
          <div className="space-y-4">
            {featured.research.length ? (
              featured.research.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="image-frame h-40 rounded-none border-0 border-b border-slate-200">
                    <img src={item.visualSrc || ""} alt={item.title} loading="lazy" />
                  </div>
                  <div className="p-4">
                    <p className="text-base font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-600">{item.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {asStringArray(item.keywords).slice(0, 4).map((keyword) => <span key={keyword} className="tag">{keyword}</span>)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">暂无科研内容</p>
            )}
          </div>
        </article>

        <article className="card p-6 hover-rise">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">精选项目</h2>
            <Link href="/portfolio" className="text-sm text-blue-700">查看全部</Link>
          </div>
          <div className="space-y-4">
            {featured.projects.length ? (
              featured.projects.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="image-frame h-40 rounded-none border-0 border-b border-slate-200">
                    <img src={item.coverImageSrc || ""} alt={item.title} loading="lazy" />
                  </div>
                  <div className="p-4">
                    <p className="text-base font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-600">{item.starResult || item.context}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {asStringArray(item.techStack).slice(0, 4).map((tech) => <span key={tech} className="tag">{tech}</span>)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">暂无项目内容</p>
            )}
          </div>
        </article>
      </section>
    </PublicShell>
  );
}

