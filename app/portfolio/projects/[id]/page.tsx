import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { MarkdownContent } from "@/components/markdown-content";
import { getProjectById, getSiteSettings } from "@/lib/public-data";
import { asStringArray } from "@/lib/public-format";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export default async function ProjectDetailPage({ params }: Props) {
  const [settings, project] = await Promise.all([getSiteSettings(), getProjectById(params.id)]);
  if (!project) notFound();

  return (
    <PublicShell siteTitle={settings.siteTitle} contactEmail={settings.contactEmail} linkedinUrl={settings.linkedinUrl} githubUrl={settings.githubUrl} footerCtaText={settings.footerCtaText} footerIntroText={settings.footerIntroText}>
      <article className="card surface p-6 md:p-8">
        <Link href="/portfolio" className="nav-pill bg-white">返回成就页</Link>
        <h1 className="hero-title mt-4">{project.title}</h1>

        {project.coverImageUrl ? <div className="image-frame mt-6 h-64"><img src={project.coverImageUrl} alt={project.title} loading="lazy" /></div> : null}

        <p className="mt-6 text-slate-700">{project.context || "暂无项目背景"}</p>
        <p className="mt-2 text-slate-700">结果：{project.starResult || "暂无"}</p>

        <div className="mt-4 flex flex-wrap gap-2">{asStringArray(project.techStack).map((tech) => <span key={tech} className="tag">{tech}</span>)}</div>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.githubUrl ? <a className="nav-pill bg-white" href={project.githubUrl}>GitHub</a> : null}
          {project.demoUrl ? <a className="nav-pill bg-white" href={project.demoUrl}>在线演示</a> : null}
          {project.externalUrl ? <a className="nav-pill bg-white" href={project.externalUrl}>外部链接</a> : null}
        </div>

        {project.detailBlogSlug ? <div className="mt-6"><a className="inline-flex nav-pill bg-white text-brand-700" href={`/blog/${project.detailBlogSlug}`}>查看关联博客</a></div> : null}
        {project.markdownContent ? <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 md:p-7"><MarkdownContent content={project.markdownContent} /></div> : null}
      </article>
    </PublicShell>
  );
}
