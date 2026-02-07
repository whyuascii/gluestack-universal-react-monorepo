import type { Metadata } from "next";
import { defaultMetadata, siteConfig, imageConfig } from "@/config/seo";

/**
 * SEO Metadata Utilities
 *
 * Helper functions to create consistent, merged metadata for pages.
 */

export interface PageMetadataOptions {
  /** Page title (will be templated as "Title | SiteName") */
  title: string;
  /** Page description for SEO */
  description: string;
  /** Canonical URL path (e.g., "/about") */
  path?: string;
  /** Custom OG image URL or params for dynamic generation */
  image?: string | { title?: string; subtitle?: string };
  /** Additional keywords for this page */
  keywords?: string[];
  /** Override robots settings */
  robots?: Metadata["robots"];
  /** Page type for Open Graph */
  type?: "website" | "article" | "profile";
  /** Article-specific metadata */
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    tags?: string[];
  };
  /** Disable indexing for this page */
  noIndex?: boolean;
}

/**
 * Create page metadata by merging with defaults
 *
 * @example
 * // Basic usage
 * export const metadata = createMetadata({
 *   title: "About Us",
 *   description: "Learn about our mission",
 * });
 *
 * @example
 * // With custom OG image
 * export const metadata = createMetadata({
 *   title: "Pricing",
 *   description: "Choose your plan",
 *   image: { title: "Simple Pricing", subtitle: "Plans for every couple" },
 * });
 */
export function createMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    image,
    keywords = [],
    robots,
    type = "website",
    article,
    noIndex = false,
  } = options;

  const url = path ? `${siteConfig.url}${path}` : siteConfig.url;

  // Build OG image URL
  let ogImageUrl: string;
  if (typeof image === "string") {
    ogImageUrl = image.startsWith("http") ? image : `${siteConfig.url}${image}`;
  } else {
    const params = new URLSearchParams();
    params.set("title", image?.title || title);
    if (image?.subtitle) params.set("subtitle", image.subtitle);
    ogImageUrl = `/og?${params.toString()}`;
  }

  const mergedKeywords = [...((defaultMetadata.keywords as string[]) || []), ...keywords];

  return {
    ...defaultMetadata,
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      ...defaultMetadata.alternates,
      canonical: url,
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      type,
      url,
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: imageConfig.og.width,
          height: imageConfig.og.height,
          alt: title,
        },
      ],
      ...(article && {
        publishedTime: article.publishedTime,
        modifiedTime: article.modifiedTime,
        authors: article.authors,
        tags: article.tags,
      }),
    },
    twitter: {
      ...defaultMetadata.twitter,
      title,
      description,
      images: [ogImageUrl],
    },
    robots: noIndex ? { index: false, follow: false } : robots || defaultMetadata.robots,
  };
}

/**
 * Create metadata for authenticated/private pages
 * These pages are not indexed by search engines
 */
export function createPrivateMetadata(
  options: Omit<PageMetadataOptions, "noIndex" | "robots">
): Metadata {
  return createMetadata({
    ...options,
    noIndex: true,
    robots: {
      index: false,
      follow: false,
    },
  });
}

/**
 * Create metadata for article/blog pages
 */
export function createArticleMetadata(
  options: PageMetadataOptions & {
    publishedTime: string;
    modifiedTime?: string;
    authors?: string[];
    tags?: string[];
  }
): Metadata {
  const { publishedTime, modifiedTime, authors, tags, ...rest } = options;

  return createMetadata({
    ...rest,
    type: "article",
    article: {
      publishedTime,
      modifiedTime,
      authors,
      tags,
    },
  });
}
