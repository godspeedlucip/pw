import { prisma } from "@/lib/prisma";

type SiteSettings = {
  siteTitle: string;
  heroSlogan: string | null;
  heroImageUrl: string | null;
  resumeFileUrl: string | null;
  homeIntroText: string | null;
  homeValueText: string | null;
  homeDescriptions: string[];
  portfolioIntroText: string | null;
  blogIntroText: string | null;
  lifeIntroText: string | null;
  footerIntroText: string | null;
  currentStatus: string | null;
  contactEmail: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  footerCtaText: string | null;
};

type MediaAssetLite = {
  id: string;
  fileName: string;
  fileUrl: string;
  assetType: string;
};

const HERO_FALLBACK = "/defaults/profile.svg";
const PROJECT_FALLBACK = "/defaults/project-cover.svg";
const BLOG_FALLBACK = "/defaults/project-cover.svg";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function directUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/");
}

function resolveMediaRef(ref: string | null | undefined, media: MediaAssetLite[]): string | null {
  if (!ref) return null;
  const trimmed = ref.trim();
  if (!trimmed) return null;
  if (directUrl(trimmed)) return trimmed;
  const hit = media.find((item) => item.id === trimmed || item.fileName === trimmed || item.fileUrl === trimmed);
  return hit?.fileUrl || null;
}

function matchByType(media: MediaAssetLite[], types: string[]): MediaAssetLite[] {
  const normalized = types.map((type) => type.toLowerCase());
  return media.filter((item) => normalized.includes(item.assetType.toLowerCase()));
}

function pickHomeDescriptions(value: unknown, intro: string | null | undefined, valueText: string | null | undefined): string[] {
  const fromJson = toStringArray(value);
  if (fromJson.length) return fromJson;
  return [intro || "", valueText || ""].map((item) => item.trim()).filter(Boolean);
}


async function getAllMedia(): Promise<MediaAssetLite[]> {
  try {
    return await prisma.mediaAsset.findMany({
      select: { id: true, fileName: true, fileUrl: true, assetType: true }
    });
  } catch {
    return [];
  }
}

export async function getOverviewCounts() {
  try {
    const [researchCount, projectCount, blogCount] = await Promise.all([
      prisma.researchEntry.count(),
      prisma.projectEntry.count(),
      prisma.blogPost.count({ where: { status: { equals: "published", mode: "insensitive" } } })
    ]);
    return { researchCount, projectCount, blogCount };
  } catch {
    return { researchCount: 0, projectCount: 0, blogCount: 0 };
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const [settings, media] = await Promise.all([
      prisma.siteSettings.findFirst({ orderBy: { updatedAt: "desc" } }),
      getAllMedia()
    ]);

    const avatarFromSetting = resolveMediaRef(settings?.heroImageUrl || null, media);
    const avatarFromMedia = matchByType(media, ["avatar", "profile", "hero"])[0]?.fileUrl || null;

    return {
      siteTitle: settings?.siteTitle || "个人网站",
      heroSlogan: settings?.heroSlogan || "聚焦科研与工程实践",
      heroImageUrl: avatarFromSetting || avatarFromMedia || HERO_FALLBACK,
      resumeFileUrl: settings?.resumeFileUrl || null,
      homeIntroText: settings?.homeIntroText || "欢迎来到我的个人网站，这里展示我的核心能力、代表成果与正在进行的方向。",
      homeValueText: settings?.homeValueText || "我注重将理论与工程结合，持续沉淀可复用的方法与高质量交付。",
      homeDescriptions: pickHomeDescriptions(settings?.homeDescriptions, settings?.homeIntroText, settings?.homeValueText),
      portfolioIntroText: settings?.portfolioIntroText || "这里汇总我的科研与项目实践，覆盖问题背景、方法过程与结果产出。",
      blogIntroText: settings?.blogIntroText || "博客用于记录技术思考、实践经验与行业观察。",
      lifeIntroText: settings?.lifeIntroText || "除了工作，我也在持续探索生活中的长期兴趣与成长轨迹。",
      footerIntroText: settings?.footerIntroText || "如果你希望进一步沟通，欢迎通过下方渠道联系我。",
      currentStatus: settings?.currentStatus || null,
      contactEmail: settings?.contactEmail || null,
      linkedinUrl: settings?.linkedinUrl || null,
      githubUrl: settings?.githubUrl || null,
      footerCtaText: settings?.footerCtaText || "联系我"
    };
  } catch {
    return {
      siteTitle: "个人网站",
      heroSlogan: "聚焦科研与工程实践",
      heroImageUrl: HERO_FALLBACK,
      resumeFileUrl: null,
      homeIntroText: "欢迎来到我的个人网站，这里展示我的核心能力、代表成果与正在进行的方向。",
      homeValueText: "我注重将理论与工程结合，持续沉淀可复用的方法与高质量交付。",
      homeDescriptions: pickHomeDescriptions(null, "欢迎来到我的个人网站，这里展示我的核心能力、代表成果与正在进行的方向。", "我注重将理论与工程结合，持续沉淀可复用的方法与高质量交付。"),
      portfolioIntroText: "这里汇总我的科研与项目实践，覆盖问题背景、方法过程与结果产出。",
      blogIntroText: "博客用于记录技术思考、实践经验与行业观察。",
      lifeIntroText: "除了工作，我也在持续探索生活中的长期兴趣与成长轨迹。",
      footerIntroText: "如果你希望进一步沟通，欢迎通过下方渠道联系我。",
      currentStatus: null,
      contactEmail: null,
      linkedinUrl: null,
      githubUrl: null,
      footerCtaText: "联系我"
    };
  }
}

export async function getFeaturedContent() {
  try {
    const [featuredResearch, featuredProjects, latestResearch, latestProjects, media] = await Promise.all([
      prisma.researchEntry.findMany({ where: { isFeatured: true }, orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }], take: 3 }),
      prisma.projectEntry.findMany({ where: { isFeatured: true }, orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }], take: 3 }),
      prisma.researchEntry.findMany({ orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }], take: 3 }),
      prisma.projectEntry.findMany({ orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }], take: 3 }),
      getAllMedia()
    ]);

    const researchSource = featuredResearch.length ? featuredResearch : latestResearch;
    const projectSource = featuredProjects.length ? featuredProjects : latestProjects;

    const researchResolved = researchSource.map((item) => ({
      ...item,
      visualSrc: resolveMediaRef(item.resultVisualUrl, media) || PROJECT_FALLBACK
    }));

    const projectsResolved = projectSource.map((item) => ({
      ...item,
      coverImageSrc:
        resolveMediaRef(item.coverImageUrl, media) ||
        matchByType(media, ["project", "project-cover", "cover"])[0]?.fileUrl ||
        PROJECT_FALLBACK
    }));

    return { research: researchResolved, projects: projectsResolved };
  } catch {
    return { research: [], projects: [] };
  }
}

export async function getPortfolioData() {
  try {
    const [research, projects, media] = await Promise.all([
      prisma.researchEntry.findMany({ orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] }),
      prisma.projectEntry.findMany({ orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] }),
      getAllMedia()
    ]);

    const researchResolved = research.map((item) => ({
      ...item,
      visualSrc: resolveMediaRef(item.resultVisualUrl, media)
    }));

    const projectsResolved = projects.map((item) => ({
      ...item,
      coverImageSrc:
        resolveMediaRef(item.coverImageUrl, media) ||
        matchByType(media, ["project", "project-cover", "cover"])[0]?.fileUrl ||
        PROJECT_FALLBACK
    }));

    return { research: researchResolved, projects: projectsResolved };
  } catch {
    return { research: [], projects: [] };
  }
}

export async function getPublishedBlogPosts() {
  try {
    const [posts, media] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: { equals: "published", mode: "insensitive" } },
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }]
      }),
      getAllMedia()
    ]);

    return posts.map((post) => ({
      ...post,
      coverImageSrc: resolveMediaRef(post.coverImageUrl, media) || BLOG_FALLBACK
    }));
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const [post, media] = await Promise.all([prisma.blogPost.findUnique({ where: { slug } }), getAllMedia()]);
    if (!post) return null;

    return {
      ...post,
      coverImageUrl: resolveMediaRef(post.coverImageUrl, media) || BLOG_FALLBACK
    };
  } catch {
    return null;
  }
}

export async function getLifeData() {
  try {
    const [life, media] = await Promise.all([
      prisma.lifeContent.findFirst({ orderBy: { updatedAt: "desc" } }),
      getAllMedia()
    ]);

    if (!life) {
      const fallbackGallery = matchByType(media, ["life", "photo", "gallery"]).slice(0, 6);
      return {
        aboutIntro: null,
        galleryResolved: fallbackGallery.map((item) => ({ ref: item.fileName, url: item.fileUrl })),
        readingList: [],
        footprints: [],
        skills: [],
        lifeSections: [],
        resumeFileUrl: null
      };
    }

    const galleryRefs = toStringArray(life.galleryImages);
    const galleryResolved = (galleryRefs.length
      ? galleryRefs
      : matchByType(media, ["life", "photo", "gallery"]).map((item) => item.fileName)
    )
      .map((ref) => ({ ref, url: resolveMediaRef(ref, media) }))
      .filter((item) => Boolean(item.url));

    const rawSections = Array.isArray(life.lifeSections) ? life.lifeSections : [];
    const lifeSections = rawSections
      .map((section) => {
        if (!section || typeof section !== "object") return null;
        const item = section as Record<string, unknown>;
        const title = String(item.title || "").trim();
        const description = String(item.description || "").trim();
        const imageRef = String(item.imageUrl || "").trim();
        return {
          id: String(item.id || `${title}-${description}`),
          title,
          description,
          imageUrl: resolveMediaRef(imageRef, media) || imageRef || null
        };
      })
      .filter(Boolean);

    return {
      ...life,
      galleryResolved,
      lifeSections
    };
  } catch {
    return null;
  }
}

export async function getResearchById(id: string) {
  try {
    const [research, media] = await Promise.all([
      prisma.researchEntry.findUnique({ where: { id } }),
      getAllMedia()
    ]);
    if (!research) return null;

    return {
      ...research,
      resultVisualUrl: resolveMediaRef(research.resultVisualUrl, media) || research.resultVisualUrl
    };
  } catch {
    return null;
  }
}

export async function getProjectById(id: string) {
  try {
    const [project, media] = await Promise.all([
      prisma.projectEntry.findUnique({ where: { id } }),
      getAllMedia()
    ]);
    if (!project) return null;

    return {
      ...project,
      coverImageUrl:
        resolveMediaRef(project.coverImageUrl, media) ||
        matchByType(media, ["project", "project-cover", "cover"])[0]?.fileUrl ||
        PROJECT_FALLBACK
    };
  } catch {
    return null;
  }
}

