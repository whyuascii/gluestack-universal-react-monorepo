import type { MetadataRoute } from "next";
import { siteConfig, sitemapConfig } from "@/config/seo";

/**
 * Dynamic Sitemap Generation
 *
 * Combines:
 * 1. Static pages from sitemapConfig.staticPages
 * 2. Dynamic pages from sitemapConfig.dynamicPages()
 *
 * Excludes pages matching patterns in sitemapConfig.excludePatterns
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Static pages from config
  const staticPages = sitemapConfig.staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Dynamic pages (e.g., blog posts, public profiles)
  const dynamicPageData = await sitemapConfig.dynamicPages();
  const dynamicPages = dynamicPageData.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency || ("weekly" as const),
    priority: page.priority || 0.7,
  }));

  return [...staticPages, ...dynamicPages];
}
