/**
 * SEO Utilities
 *
 * Central export for all SEO-related utilities.
 *
 * @example
 * import { createMetadata, generateOrganizationSchema, StructuredData } from '@/lib/seo';
 *
 * // In layout or page
 * export const metadata = createMetadata({
 *   title: "About Us",
 *   description: "Learn about our mission",
 * });
 *
 * // In component
 * <StructuredData data={[
 *   generateOrganizationSchema(),
 *   generateWebSiteSchema(),
 * ]} />
 */

// Metadata helpers
export {
  createMetadata,
  createPrivateMetadata,
  createArticleMetadata,
  type PageMetadataOptions,
} from "./metadata";

// Structured data generators
export {
  // Generators
  generateOrganizationSchema,
  generateWebApplicationSchema,
  generateSoftwareApplicationSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateWebSiteSchema,
  generateArticleSchema,
  generateProductSchema,
  generateLocalBusinessSchema,
  generateHowToSchema,
  // AEO (Answer Engine Optimization)
  generateSpeakableSchema,
  generateQAPageSchema,
  generateVideoSchema,
  // Utilities
  combineStructuredData,
  StructuredData,
  // Types
  type OrganizationData,
  type WebApplicationData,
  type SoftwareApplicationData,
  type FAQItem,
  type BreadcrumbItem,
  type ArticleData,
  type ProductData,
  type LocalBusinessData,
  type SpeakableData,
  type QAPageData,
  type VideoObjectData,
} from "./structured-data";

// Re-export config for convenience
export {
  siteConfig,
  socialConfig,
  imageConfig,
  defaultMetadata,
  pageMetadata,
  sitemapConfig,
  robotsConfig,
} from "@/config/seo";
