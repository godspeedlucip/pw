import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { MarkdownContent } from "@/components/markdown-content";
import { getBlogPostBySlug, getSiteSettings } from "@/lib/public-data";
import { asStringArray, formatDate } from "@/lib/public-format";

export const dynamic = "force-dynamic";

type BlogDetailPageProps = {
  params: { slug: string };
};

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const [settings, post] = await Promise.all([getSiteSettings(), getBlogPostBySlug(params.slug)]);

  if (!post || String(post.status || "").toLowerCase() !== "published") {
    notFound();
  }

  return (
    <PublicShell
      siteTitle={settings.siteTitle}
      contactEmail={settings.contactEmail}
      linkedinUrl={settings.linkedinUrl}
      githubUrl={settings.githubUrl}
      footerCtaText={settings.footerCtaText}
      footerIntroText={settings.footerIntroText}
    >
      <article className="card surface p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="chip">{post.category || "未分类"}</span>
          <span className="tag">{formatDate(post.publishedAt)}</span>
          <span className="tag">{post.readingTimeMinutes} 分钟阅读</span>
        </div>
        <h1 className="hero-title mt-4">{post.title}</h1>

        {post.coverImageUrl ? (
          <div className="image-frame mt-6 h-72">
            <img src={post.coverImageUrl} alt={post.title} loading="lazy" />
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {asStringArray(post.tags).map((tag) => (
            <span className="tag" key={tag}>{tag}</span>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
          <MarkdownContent content={post.markdownBody} />
        </div>
      </article>
    </PublicShell>
  );
}
