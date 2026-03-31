import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { MarkdownContent } from "@/components/markdown-content";
import { getProjectById, getSiteSettings } from "@/lib/public-data";
import { asStringArray } from "@/lib/public-format";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

function lowerPath(url: string) {
  return url.split("?")[0].toLowerCase();
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(lowerPath(url));
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(lowerPath(url));
}

function parseUrl(url: string) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function getYoutubeId(url: URL) {
  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" || host.endsWith(".youtu.be")) {
    return parts[0] || null;
  }

  if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
    const byQuery = url.searchParams.get("v");
    if (byQuery) return byQuery;

    if (parts[0] === "shorts" || parts[0] === "embed") {
      return parts[1] || null;
    }
  }

  return null;
}

function getBilibiliBvid(url: URL) {
  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);
  const byQuery = url.searchParams.get("bvid");

  if (byQuery) return byQuery;

  const bvInPath = parts.find((part) => /^BV[0-9A-Za-z]+$/.test(part));
  if (bvInPath) return bvInPath;

  if (host === "b23.tv" || host.endsWith(".b23.tv")) {
    const possible = parts[0] || "";
    if (/^BV[0-9A-Za-z]+$/.test(possible)) {
      return possible;
    }
  }

  return null;
}

function getDemoEmbed(urlText: string): { src: string; title: string } | null {
  const url = parseUrl(urlText);
  if (!url) return null;

  const host = url.hostname.toLowerCase();
  const youtubeId = getYoutubeId(url);
  if (youtubeId) {
    return {
      src: `https://www.youtube.com/embed/${youtubeId}`,
      title: "YouTube 演示"
    };
  }

  if (host.includes("bilibili.com") || host === "b23.tv" || host.endsWith(".b23.tv")) {
    const bvid = getBilibiliBvid(url);
    if (bvid) {
      return {
        src: `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1`,
        title: "B 站演示"
      };
    }
  }

  return null;
}

export default async function ProjectDetailPage({ params }: Props) {
  const [settings, project] = await Promise.all([getSiteSettings(), getProjectById(params.id)]);
  if (!project) notFound();

  const demoEmbed = project.demoUrl ? getDemoEmbed(project.demoUrl) : null;

  return (
    <PublicShell siteTitle={settings.siteTitle} contactEmail={settings.contactEmail} linkedinUrl={settings.linkedinUrl} githubUrl={settings.githubUrl} footerCtaText={settings.footerCtaText} footerIntroText={settings.footerIntroText}>
      <article className="card surface p-6 md:p-8">
        <Link href="/portfolio" className="nav-pill bg-white">返回成就页</Link>
        <h1 className="hero-title mt-4">{project.title}</h1>

        {project.coverImageUrl ? <div className="image-frame mt-6 h-64"><img src={project.coverImageUrl} alt={project.title} loading="lazy" /></div> : null}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
          <h2 className="text-base font-semibold text-slate-900">项目背景</h2>
          <p className="mt-2 text-slate-700">{project.context || "暂无项目背景"}</p>
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
          <h2 className="text-base font-semibold text-slate-900">STAR 过程</h2>
          <div className="mt-3 space-y-3 text-slate-700">
            <p><span className="font-medium text-slate-900">情境（Situation）：</span>{project.starSituation || "暂无"}</p>
            <p><span className="font-medium text-slate-900">任务（Task）：</span>{project.starTask || "暂无"}</p>
            <p><span className="font-medium text-slate-900">行动（Action）：</span>{project.starAction || "暂无"}</p>
            <p><span className="font-medium text-slate-900">结果（Result）：</span>{project.starResult || "暂无"}</p>
          </div>
        </section>

        <div className="mt-4 flex flex-wrap gap-2">{asStringArray(project.techStack).map((tech) => <span key={tech} className="tag">{tech}</span>)}</div>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.githubUrl ? <a className="nav-pill bg-white" href={project.githubUrl}>GitHub</a> : null}
          {project.externalUrl ? <a className="nav-pill bg-white" href={project.externalUrl}>外部链接</a> : null}
        </div>

        {project.demoUrl ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
            <h2 className="text-base font-semibold text-slate-900">演示内容</h2>
            <div className="mt-2">
              {isImageUrl(project.demoUrl) ? (
                <div className="image-frame h-72">
                  <img src={project.demoUrl} alt={`${project.title} 演示图`} loading="lazy" />
                </div>
              ) : null}
              {isVideoUrl(project.demoUrl) ? (
                <video className="w-full rounded-xl border border-slate-200 bg-black" controls src={project.demoUrl} />
              ) : null}
              {demoEmbed ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-black">
                  <iframe
                    className="h-[420px] w-full"
                    src={demoEmbed.src}
                    title={demoEmbed.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {project.detailBlogSlug ? <div className="mt-6"><a className="inline-flex nav-pill bg-white text-brand-700" href={`/blog/${project.detailBlogSlug}`}>查看关联博客</a></div> : null}
        {project.markdownContent ? <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 md:p-7"><MarkdownContent content={project.markdownContent} /></div> : null}
      </article>
    </PublicShell>
  );
}