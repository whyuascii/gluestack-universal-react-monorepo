import type { Metadata } from "next";

/**
 * Central SEO Configuration
 *
 * This file is the single source of truth for all SEO-related settings.
 * Import and use these values throughout the app for consistent metadata.
 *
 * CUSTOMIZATION:
 * Update the siteConfig values below to match your app's branding.
 * Environment variables can override the defaults at runtime.
 */

// =============================================================================
// Site Information
// =============================================================================

export const siteConfig = {
  // TODO: Update these for your app
  name: process.env.NEXT_PUBLIC_SITE_NAME || "App Name",
  shortName: process.env.NEXT_PUBLIC_SITE_SHORT_NAME || "App",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "A production-ready cross-platform application template built with Next.js, React Native, and Fastify.",
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || "Build something amazing",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  locale: "en_US",
  locales: ["en_US", "es_ES"] as const,
  themeColor: "#F97066", // Primary color from starter theme (warm coral)
  backgroundColor: "#FFFFFF",
  author: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || "App Name",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  },
  creator: process.env.NEXT_PUBLIC_SITE_CREATOR || "Your Team",
  publisher: process.env.NEXT_PUBLIC_SITE_NAME || "App Name",
} as const;

// =============================================================================
// Social Media & Open Graph
// =============================================================================

export const socialConfig = {
  twitter: {
    // TODO: Update with your social handles
    handle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@yourapp",
    site: process.env.NEXT_PUBLIC_TWITTER_SITE || "@yourapp",
    cardType: "summary_large_image" as const,
  },
  facebook: {
    appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
  },
  // TODO: Add your social profile URLs
  profiles: {
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || "https://twitter.com/yourapp",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/yourapp",
    // Add more as needed
  },
} as const;

// =============================================================================
// Default Images
// =============================================================================

export const imageConfig = {
  // Default OG image dimensions (recommended: 1200x630)
  og: {
    width: 1200,
    height: 630,
  },
  // Default Twitter card dimensions
  twitter: {
    width: 1200,
    height: 600,
  },
  // Logo for structured data (uses android-chrome-512x512 as logo)
  logo: {
    url: `${siteConfig.url}/icons/android-chrome-512x512.png`,
    width: 512,
    height: 512,
  },
} as const;

// =============================================================================
// Default Metadata (used by root layout)
// =============================================================================

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [siteConfig.author],
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    alternateLocale: siteConfig.locales.filter((l) => l !== siteConfig.locale),
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: `/og?title=${encodeURIComponent(siteConfig.tagline)}`,
        width: imageConfig.og.width,
        height: imageConfig.og.height,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: socialConfig.twitter.cardType,
    site: socialConfig.twitter.site,
    creator: socialConfig.twitter.handle,
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [`/og?title=${encodeURIComponent(siteConfig.tagline)}`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icons/favicon.ico",
    shortcut: "/icons/favicon-16x16.png",
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteConfig.url,
    languages: {
      "en-US": `${siteConfig.url}/en`,
      "es-ES": `${siteConfig.url}/es`,
    },
  },
  category: "technology",
  keywords: [
    "saas",
    "application",
    "cross-platform",
    "web app",
    "mobile app",
    "productivity",
    "team collaboration",
    "project management",
  ],
};

// =============================================================================
// Page-Specific Metadata Presets
// =============================================================================

export const pageMetadata = {
  home: {
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  login: {
    title: "Sign In",
    description: `Sign in to your ${siteConfig.name} account.`,
  },
  signup: {
    title: "Create Account",
    description: `Create your ${siteConfig.name} account and get started.`,
  },
  dashboard: {
    title: "Dashboard",
    description: "Your dashboard overview - everything at a glance.",
  },
  pricing: {
    title: "Pricing",
    description: `Choose the perfect ${siteConfig.name} plan for your needs.`,
  },
  about: {
    title: "About Us",
    description: `Learn about ${siteConfig.name} and our mission.`,
  },
  contact: {
    title: "Contact",
    description: `Get in touch with the ${siteConfig.name} team.`,
  },
  privacy: {
    title: "Privacy Policy",
    description: `How ${siteConfig.name} protects your data and respects your privacy.`,
  },
  terms: {
    title: "Terms of Service",
    description: `Terms and conditions for using ${siteConfig.name}.`,
  },
} as const;

// =============================================================================
// Sitemap Configuration
// =============================================================================

export const sitemapConfig = {
  // Static pages to always include
  staticPages: [
    { path: "/", changeFrequency: "weekly" as const, priority: 1.0 },
    { path: "/login", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/signup", changeFrequency: "monthly" as const, priority: 0.8 },
    // Add more static pages as needed
  ],
  // Routes to exclude from auto-discovery
  excludePatterns: [
    "/api/**",
    "/og/**",
    "/_next/**",
    "/dashboard/**", // Authenticated pages
    "/group/**", // Authenticated pages
    "/invite/**", // Dynamic invite pages
  ],
  // Add dynamic pages manually (e.g., blog posts, public profiles)
  dynamicPages: async (): Promise<
    Array<{ path: string; changeFrequency?: "weekly" | "monthly" | "daily"; priority?: number }>
  > => {
    // Example: Fetch blog posts from database or CMS
    // const posts = await getBlogPosts();
    // return posts.map(post => ({
    //   path: `/blog/${post.slug}`,
    //   changeFrequency: 'weekly',
    //   priority: 0.7,
    // }));
    return [];
  },
} as const;

// =============================================================================
// Robots Configuration
// =============================================================================

export const robotsConfig = {
  rules: [
    {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/group/", "/invite/", "/_next/"],
    },
  ],
  sitemap: `${siteConfig.url}/sitemap.xml`,
} as const;
