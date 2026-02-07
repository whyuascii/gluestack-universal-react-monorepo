import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import StyledJsxRegistry from "./registry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Portal | Dogfoo Internal",
  description: "Internal admin portal for Dev + CSM teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-full`}>
        <StyledJsxRegistry>
          <Providers>
            <main className="flex flex-col flex-1 min-h-0">{children}</main>
          </Providers>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
