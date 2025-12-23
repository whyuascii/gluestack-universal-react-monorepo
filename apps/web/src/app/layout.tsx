import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import StyledJsxRegistry from "./registry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "App - Task Management",
  description: "A simple task management application to help you stay organized and productive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ flex: 1 }}
      >
        <StyledJsxRegistry>
          <Providers>
            <div className="h-screen w-screen overflow-hidden overflow-y-scroll">{children}</div>
          </Providers>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
