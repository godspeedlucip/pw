import Link from "next/link";

type PublicShellProps = {
  siteTitle: string;
  contactEmail?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  footerCtaText?: string | null;
  footerIntroText?: string | null;
  children: React.ReactNode;
};

const links = [
  { href: "/", label: "home" },
  { href: "/portfolio", label: "projects" },
  { href: "/blog", label: "blog" },
  { href: "/life", label: "about me" }
];

export function PublicShell({
  siteTitle,
  contactEmail,
  linkedinUrl,
  githubUrl,
  footerCtaText,
  footerIntroText,
  children
}: PublicShellProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/65 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-6">
          <Link href="/" className="text-base font-semibold tracking-[0.01em] text-slate-900 md:text-lg">
            {siteTitle}
          </Link>
          <nav className="flex gap-2 md:gap-3">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="nav-pill">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 md:px-6 md:py-12">{children}</main>

      <footer className="mx-auto mt-10 max-w-6xl px-5 pb-12 md:px-6">
        <section className="card surface p-6 md:p-8">
          <p className="chip">{footerCtaText || "联系我"}</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">欢迎交流合作</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {footerIntroText || "如果你对我的研究、项目或文章感兴趣，欢迎通过下方方式联系我。"}
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`} className="nav-pill bg-white">发送邮件</a>
            ) : (
              <span className="nav-pill bg-white">暂未设置邮箱</span>
            )}
            {linkedinUrl ? <a href={linkedinUrl} className="nav-pill bg-white">LinkedIn</a> : null}
            {githubUrl ? <a href={githubUrl} className="nav-pill bg-white">GitHub</a> : null}
          </div>
        </section>
      </footer>
    </div>
  );
}
