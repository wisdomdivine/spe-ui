import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spe-ui.vercel.app";
  const now = new Date();

  // Static pages with their priorities
  const staticPages = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/about/team", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/events", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/membership", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/lms", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/programs/electoral-session", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/programs/guest-electoral-session", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/programs/membership-spotlight", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/programs/resources", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/programs/sponsor", priority: 0.5, changeFrequency: "monthly" as const },
  ];

  return staticPages.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
