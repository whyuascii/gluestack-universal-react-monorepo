"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GluestackUIProvider } from "components";
import { Geist, Geist_Mono } from "next/font/google";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./globals.css";
import StyledJsxRegistry from "./registry";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <html lang="en">
      <head>
        <title>TaskManager - Manage Your Tasks Effortlessly</title>
        <meta
          name="description"
          content="The all-in-one platform for teams to collaborate, organize, and get things done faster."
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ flex: 1 }}
      >
        <StyledJsxRegistry>
          <QueryClientProvider client={queryClient}>
            <GluestackUIProvider>
              <SafeAreaProvider className={` flex-1 overflow-hidden`}>
                <div className="h-screen w-screen overflow-hidden overflow-y-scroll">
                  {children}
                </div>
              </SafeAreaProvider>
            </GluestackUIProvider>
          </QueryClientProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
