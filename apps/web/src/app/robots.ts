import type { MetadataRoute } from "next";
import { robotsConfig, siteConfig } from "@/config/seo";

/**
 * Robots.txt Generation
 *
 * Controls search engine crawling behavior.
 * Configure rules in config/seo.ts under robotsConfig.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: robotsConfig.rules.map((rule) => ({
      userAgent: rule.userAgent,
      allow: rule.allow,
      disallow: [...rule.disallow], // Spread to convert readonly array to mutable
    })),
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
