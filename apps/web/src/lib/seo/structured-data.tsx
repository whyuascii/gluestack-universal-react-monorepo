import { siteConfig, imageConfig, socialConfig } from "@/config/seo";

/**
 * JSON-LD Structured Data Generators
 *
 * These functions generate schema.org structured data for rich search results.
 * Use them in your pages by adding the output to a <script type="application/ld+json"> tag.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data
 * @see https://schema.org
 */

// =============================================================================
// Type Definitions
// =============================================================================

export interface OrganizationData {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
  contactPoint?: {
    type: string;
    email?: string;
    telephone?: string;
    contactType?: string;
    availableLanguage?: string[];
  };
}

export interface WebApplicationData {
  name?: string;
  description?: string;
  url?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    ratingCount: number;
  };
}

export interface SoftwareApplicationData {
  name?: string;
  description?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  downloadUrl?: string;
  aggregateRating?: {
    ratingValue: number;
    ratingCount: number;
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ArticleData {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: {
    name: string;
    url?: string;
  };
}

export interface ProductData {
  name: string;
  description: string;
  image?: string;
  brand?: string;
  sku?: string;
  offers?: {
    price: string;
    priceCurrency: string;
    availability?: "InStock" | "OutOfStock" | "PreOrder";
    url?: string;
    priceValidUntil?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export interface LocalBusinessData {
  name?: string;
  description?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone?: string;
  email?: string;
  openingHours?: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
  priceRange?: string;
}

// =============================================================================
// Structured Data Generators
// =============================================================================

/**
 * Generate Organization schema
 * Use on: Homepage, About page, Contact page
 */
export function generateOrganizationSchema(data: OrganizationData = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name || siteConfig.name,
    description: data.description || siteConfig.description,
    url: data.url || siteConfig.url,
    logo: data.logo || imageConfig.logo.url,
    sameAs: data.sameAs || Object.values(socialConfig.profiles),
    ...(data.contactPoint && {
      contactPoint: {
        "@type": "ContactPoint",
        contactType: data.contactPoint.type,
        email: data.contactPoint.email,
        telephone: data.contactPoint.telephone,
      },
    }),
  };
}

/**
 * Generate WebApplication schema
 * Use on: Homepage, Landing pages
 */
export function generateWebApplicationSchema(data: WebApplicationData = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: data.name || siteConfig.name,
    description: data.description || siteConfig.description,
    url: data.url || siteConfig.url,
    applicationCategory: data.applicationCategory || "LifestyleApplication",
    operatingSystem: data.operatingSystem || "Web, iOS, Android",
    ...(data.offers && {
      offers: {
        "@type": "Offer",
        price: data.offers.price || "0",
        priceCurrency: data.offers.priceCurrency || "USD",
      },
    }),
    ...(data.aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: data.aggregateRating.ratingValue,
        ratingCount: data.aggregateRating.ratingCount,
      },
    }),
  };
}

/**
 * Generate SoftwareApplication schema (for app store listings)
 * Use on: Download/App pages
 */
export function generateSoftwareApplicationSchema(data: SoftwareApplicationData = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: data.name || siteConfig.name,
    description: data.description || siteConfig.description,
    applicationCategory: data.applicationCategory || "LifestyleApplication",
    operatingSystem: data.operatingSystem || "iOS, Android",
    ...(data.downloadUrl && {
      downloadUrl: data.downloadUrl,
    }),
    ...(data.aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: data.aggregateRating.ratingValue,
        ratingCount: data.aggregateRating.ratingCount,
      },
    }),
  };
}

/**
 * Generate FAQPage schema
 * Use on: FAQ page, Landing pages with FAQ sections
 */
export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList schema
 * Use on: Any page with breadcrumb navigation
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };
}

/**
 * Generate WebSite schema with search action
 * Use on: Homepage
 */
export function generateWebSiteSchema(searchUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: imageConfig.logo.url,
        width: imageConfig.logo.width,
        height: imageConfig.logo.height,
      },
    },
    ...(searchUrl && {
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteConfig.url}${searchUrl}?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    }),
  };
}

/**
 * Generate Article schema
 * Use on: Blog posts, news articles, documentation
 */
export function generateArticleSchema(data: ArticleData) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.headline,
    description: data.description,
    image: data.image || `${siteConfig.url}/og?title=${encodeURIComponent(data.headline)}`,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    author: {
      "@type": "Person",
      name: data.author?.name || siteConfig.author.name,
      url: data.author?.url || siteConfig.author.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: imageConfig.logo.url,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": siteConfig.url,
    },
  };
}

/**
 * Generate Product schema
 * Use on: Pricing pages, product pages
 */
export function generateProductSchema(data: ProductData) {
  const availabilityMap = {
    InStock: "https://schema.org/InStock",
    OutOfStock: "https://schema.org/OutOfStock",
    PreOrder: "https://schema.org/PreOrder",
  };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name,
    description: data.description,
    image: data.image || imageConfig.logo.url,
    brand: {
      "@type": "Brand",
      name: data.brand || siteConfig.name,
    },
    ...(data.sku && { sku: data.sku }),
    ...(data.offers && {
      offers: {
        "@type": "Offer",
        price: data.offers.price,
        priceCurrency: data.offers.priceCurrency,
        availability: availabilityMap[data.offers.availability || "InStock"],
        url: data.offers.url || siteConfig.url,
        ...(data.offers.priceValidUntil && {
          priceValidUntil: data.offers.priceValidUntil,
        }),
      },
    }),
    ...(data.aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: data.aggregateRating.ratingValue,
        reviewCount: data.aggregateRating.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
}

/**
 * Generate LocalBusiness schema
 * Use on: Contact page, location pages (if you have physical locations)
 */
export function generateLocalBusinessSchema(data: LocalBusinessData) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: data.name || siteConfig.name,
    description: data.description || siteConfig.description,
    url: siteConfig.url,
    logo: imageConfig.logo.url,
    address: {
      "@type": "PostalAddress",
      streetAddress: data.address.streetAddress,
      addressLocality: data.address.addressLocality,
      addressRegion: data.address.addressRegion,
      postalCode: data.address.postalCode,
      addressCountry: data.address.addressCountry,
    },
    ...(data.telephone && { telephone: data.telephone }),
    ...(data.email && { email: data.email }),
    ...(data.openingHours && { openingHours: data.openingHours }),
    ...(data.priceRange && { priceRange: data.priceRange }),
    ...(data.geo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: data.geo.latitude,
        longitude: data.geo.longitude,
      },
    }),
  };
}

/**
 * Generate HowTo schema
 * Use on: Tutorial pages, step-by-step guides
 */
export function generateHowToSchema(data: {
  name: string;
  description: string;
  steps: Array<{
    name: string;
    text: string;
    image?: string;
  }>;
  totalTime?: string; // ISO 8601 duration (e.g., "PT30M" for 30 minutes)
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: data.name,
    description: data.description,
    ...(data.totalTime && { totalTime: data.totalTime }),
    step: data.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };
}

// =============================================================================
// AEO (Answer Engine Optimization) Schemas
// =============================================================================

export interface SpeakableData {
  /** Page headline/title */
  headline: string;
  /** Page description */
  description?: string;
  /** CSS selectors for speakable content sections (e.g., "#intro", ".summary") */
  cssSelectors?: string[];
  /** XPath expressions for speakable content (alternative to CSS selectors) */
  xpaths?: string[];
  /** URL of the page (defaults to siteConfig.url) */
  url?: string;
  /** Date published in ISO format */
  datePublished?: string;
  /** Featured image URL */
  image?: string;
}

/**
 * Generate Speakable schema for voice assistants (Google Assistant, Alexa, Siri)
 * Use on: Help pages, FAQ pages, blog posts, landing pages with key messaging
 *
 * This tells voice assistants which sections of your page are suitable for
 * text-to-speech reading. Use CSS selectors to mark speakable sections.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/speakable
 *
 * @example
 * generateSpeakableSchema({
 *   headline: "How to Get Started",
 *   description: "A quick guide to getting started with our app",
 *   cssSelectors: ["#intro", "#key-features", "#summary"],
 * })
 */
export function generateSpeakableSchema(data: SpeakableData) {
  const speakable: Record<string, unknown> = {
    "@type": "SpeakableSpecification",
  };

  if (data.cssSelectors && data.cssSelectors.length > 0) {
    speakable.cssSelector = data.cssSelectors;
  }
  if (data.xpaths && data.xpaths.length > 0) {
    speakable.xpath = data.xpaths;
  }

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: data.headline,
    description: data.description || siteConfig.description,
    url: data.url || siteConfig.url,
    speakable,
    ...(data.datePublished && { datePublished: data.datePublished }),
    ...(data.image && { image: data.image }),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: imageConfig.logo.url,
      },
    },
  };
}

export interface QAPageData {
  /** The question being asked */
  question: string;
  /** The answer to the question */
  answer: string;
  /** Optional author of the answer */
  author?: {
    name: string;
    url?: string;
  };
  /** Date the answer was created */
  dateCreated?: string;
  /** Number of upvotes/likes (for ranking) */
  upvoteCount?: number;
  /** URL of the page */
  url?: string;
}

/**
 * Generate QAPage schema for single question-answer pages
 * Use on: Individual help articles, support pages, single FAQ items
 *
 * Different from FAQPage which is for multiple Q&As on one page.
 * QAPage is for a dedicated page answering one specific question.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/qapage
 *
 * @example
 * generateQAPageSchema({
 *   question: "How do I reset my password?",
 *   answer: "Go to Settings > Security > Reset Password...",
 *   author: { name: "Support Team" },
 *   upvoteCount: 42,
 * })
 */
export function generateQAPageSchema(data: QAPageData) {
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: data.question,
      text: data.question,
      answerCount: 1,
      ...(data.dateCreated && { dateCreated: data.dateCreated }),
      ...(data.upvoteCount && { upvoteCount: data.upvoteCount }),
      acceptedAnswer: {
        "@type": "Answer",
        text: data.answer,
        ...(data.dateCreated && { dateCreated: data.dateCreated }),
        ...(data.upvoteCount && { upvoteCount: data.upvoteCount }),
        ...(data.author && {
          author: {
            "@type": "Person",
            name: data.author.name,
            ...(data.author.url && { url: data.author.url }),
          },
        }),
        url: data.url || siteConfig.url,
      },
    },
  };
}

export interface VideoObjectData {
  /** Video title */
  name: string;
  /** Video description */
  description: string;
  /** URL to the video thumbnail image */
  thumbnailUrl: string;
  /** Date uploaded in ISO format */
  uploadDate: string;
  /** Duration in ISO 8601 format (e.g., "PT1M30S" for 1 min 30 sec) */
  duration?: string;
  /** URL where the video can be watched */
  contentUrl?: string;
  /** URL to embed the video */
  embedUrl?: string;
  /** Number of times the video has been viewed */
  interactionCount?: number;
}

/**
 * Generate VideoObject schema for video content
 * Use on: Pages with embedded videos, video tutorials, product demos
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/video
 *
 * @example
 * generateVideoSchema({
 *   name: "Getting Started Tutorial",
 *   description: "Learn how to set up your account in 2 minutes",
 *   thumbnailUrl: "https://example.com/video-thumb.jpg",
 *   uploadDate: "2024-01-15",
 *   duration: "PT2M15S",
 *   embedUrl: "https://youtube.com/embed/abc123",
 * })
 */
export function generateVideoSchema(data: VideoObjectData) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: data.name,
    description: data.description,
    thumbnailUrl: data.thumbnailUrl,
    uploadDate: data.uploadDate,
    ...(data.duration && { duration: data.duration }),
    ...(data.contentUrl && { contentUrl: data.contentUrl }),
    ...(data.embedUrl && { embedUrl: data.embedUrl }),
    ...(data.interactionCount && {
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: { "@type": "WatchAction" },
        userInteractionCount: data.interactionCount,
      },
    }),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: imageConfig.logo.url,
      },
    },
  };
}

// =============================================================================
// Helper Component & Utilities
// =============================================================================

/**
 * Combine multiple structured data objects into a @graph
 * Use when you need to include multiple schemas on one page
 *
 * @example
 * const combined = combineStructuredData(
 *   generateOrganizationSchema(),
 *   generateWebSiteSchema(),
 * );
 */
export function combineStructuredData(...schemas: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": schemas.map((schema) => {
      // Remove @context from individual schemas when combining
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { "@context": _, ...rest } = schema;
      return rest;
    }),
  };
}

interface StructuredDataProps {
  /** Single schema or array of schemas to render */
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Render structured data as a JSON-LD script tag
 *
 * @example
 * // Single schema
 * <StructuredData data={generateOrganizationSchema()} />
 *
 * @example
 * // Multiple schemas (automatically combined into @graph)
 * <StructuredData data={[
 *   generateOrganizationSchema(),
 *   generateWebSiteSchema(),
 *   generateWebApplicationSchema(),
 * ]} />
 */
export function StructuredData({ data }: StructuredDataProps) {
  const jsonLd = Array.isArray(data) ? combineStructuredData(...data) : data;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
