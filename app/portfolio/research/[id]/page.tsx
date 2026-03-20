import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { getResearchById, getSiteSettings } from "@/lib/public-data";
import { asStringArray } from "@/lib/public-format";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export default async function ResearchDetailPage({ params }: Props) {
  const [settings, research] = await Promise.all([getSiteSettings(), getResearchById(params.id)]);
  if (!research) notFound();

  return (
    <PublicShell siteTitle={settings.siteTitle} contactEmail={settings.contactEmail} linkedinUrl={settings.linkedinUrl} githubUrl={settings.githubUrl} footerCtaText={settings.footerCtaText} footerIntroText={settings.footerIntroText}>
      <article className="card surface p-6 md:p-8">
        <Link href="/portfolio" className="nav-pill bg-white">返回成就页</Link>
        <h1 className="hero-title mt-4">{research.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{research.role || "未填写角色"}</p>

        {research.resultVisualUrl ? <div className="image-frame mt-6 h-64"><img src={research.resultVisualUrl} alt={research.title} loading="lazy" /></div> : null}

        <p className="mt-6 text-slate-700">{research.summary || "暂无摘要"}</p>
        <div className="mt-4 flex flex-wrap gap-2">{asStringArray(research.keywords).map((keyword) => <span key={keyword} className="tag">{keyword}</span>)}</div>
        <p className="mt-4 text-sm text-slate-600">工具：{asStringArray(research.tools).join(", ") || "暂无"}</p>
        {research.externalUrl ? <a className="mt-5 inline-flex nav-pill bg-white text-brand-700" href={research.externalUrl}>查看外部链接</a> : null}
      </article>
    </PublicShell>
  );
}
