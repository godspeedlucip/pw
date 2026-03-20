import { PublicShell } from "@/components/public-shell";
import { getLifeData, getSiteSettings } from "@/lib/public-data";
import { asStringArray } from "@/lib/public-format";

export const dynamic = "force-dynamic";

export default async function LifePage() {
  const [settings, life] = await Promise.all([getSiteSettings(), getLifeData()]);

  const books = asStringArray(life?.readingList);
  const footprints = asStringArray(life?.footprints);
  const skills = asStringArray(life?.skills);

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
        <p className="chip">个人特质 / 生活</p>
        <h1 className="hero-title mt-3">工作之外的我</h1>
        <p className="mt-3 max-w-3xl text-slate-700">{settings.lifeIntroText || life?.aboutIntro || "这里记录我的兴趣、阅读与足迹。"}</p>
        {life?.resumeFileUrl ? (
          <a className="mt-5 inline-flex nav-pill bg-white text-brand-700" href={life.resumeFileUrl}>下载简历</a>
        ) : null}
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-[1.4fr,1fr]">
        <article className="card p-6 hover-rise">
          <h2 className="section-title">日常图片</h2>
          {life?.galleryResolved?.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {life.galleryResolved.map((item: any) => (
                <div className="image-frame h-32 md:h-36" key={item.ref}><img src={item.url || ""} alt={item.ref} loading="lazy" /></div>
              ))}
            </div>
          ) : <p className="mt-3 text-sm text-slate-700">暂无图片</p>}
        </article>

        <article className="card p-6 hover-rise">
          <h2 className="section-title">阅读清单</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">{books.length ? books.map((item) => <li key={item}>- {item}</li>) : <li>- 暂无</li>}</ul>
        </article>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="card p-6 hover-rise">
          <h2 className="section-title">我的足迹</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">{footprints.length ? footprints.map((item) => <li key={item}>- {item}</li>) : <li>- 暂无</li>}</ul>
        </article>
        <article className="card p-6 hover-rise">
          <h2 className="section-title">技能</h2>
          <div className="mt-4 flex flex-wrap gap-2">{skills.length ? skills.map((item) => <span className="tag" key={item}>{item}</span>) : <span className="text-sm text-slate-700">暂无</span>}</div>
        </article>
      </section>

      {life?.lifeSections?.length ? (
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {life.lifeSections.map((section: any) => (
            <article key={section.id} className="card hover-rise overflow-hidden p-0">
              {section.imageUrl ? <div className="image-frame h-48 rounded-none border-0 border-b border-slate-200"><img src={section.imageUrl} alt={section.title || "生活图"} loading="lazy" /></div> : null}
              <div className="p-6">
                <h2 className="section-title text-xl">{section.title || "未命名板块"}</h2>
                <p className="mt-3 text-sm text-slate-700">{section.description || "暂无描述"}</p>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </PublicShell>
  );
}
