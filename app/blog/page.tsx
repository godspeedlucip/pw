import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { getPublishedBlogPosts, getSiteSettings } from "@/lib/public-data";
import { asStringArray, formatDate } from "@/lib/public-format";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const [settings, posts] = await Promise.all([getSiteSettings(), getPublishedBlogPosts()]);

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
        <p className="chip">我的博客</p>
        <h1 className="hero-title mt-3">技术博客</h1>
        <p className="mt-3 text-slate-600">{settings.blogIntroText}</p>
      </section>

      <section className="mt-10 grid gap-5">
        {posts.map((post: any) => (
          <article key={post.id} className="card hover-rise overflow-hidden p-0">
            <div className="image-frame h-52 rounded-none border-0 border-b border-slate-200">
              <img src={post.coverImageSrc || ""} alt={post.title} loading="lazy" />
            </div>
            <div className="p-6 md:p-7">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="chip">{post.category || "未分类"}</span>
                <span className="tag">{formatDate(post.publishedAt)}</span>
                <span className="tag">{post.readingTimeMinutes} 分钟/阅读时间</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900">{post.title}</h2>
              <p className="mt-3 text-slate-700">{post.excerpt}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {asStringArray(post.tags).map((tag) => <span className="tag" key={tag}>{tag}</span>)}
              </div>
              <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex nav-pill bg-white text-brand-700">阅读全文</Link>
            </div>
          </article>
        ))}
        {!posts.length && <p className="text-sm text-slate-500">暂无已发布文章</p>}
      </section>
    </PublicShell>
  );
}
