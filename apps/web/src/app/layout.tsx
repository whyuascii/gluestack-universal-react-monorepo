import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import StyledJsxRegistry from "./registry";
import { defaultMetadata } from "@/config/seo";
import {
  StructuredData,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateWebApplicationSchema,
} from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO metadata is centralized in config/seo.ts
export const metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Structured Data (JSON-LD) for rich search results */}
        <StructuredData
          data={[
            generateOrganizationSchema(),
            generateWebSiteSchema(),
            generateWebApplicationSchema({
              offers: { price: "0", priceCurrency: "USD" },
            }),
          ]}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-full`}
      >
        <StyledJsxRegistry>
          <Providers>
            <main className="flex flex-col flex-1 min-h-0">{children}</main>
          </Providers>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
