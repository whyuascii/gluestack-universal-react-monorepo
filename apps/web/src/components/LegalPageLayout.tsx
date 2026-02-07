"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react-native";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12">
          <header className="mb-8 pb-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
          </header>

          <div className="prose prose-gray max-w-none">{children}</div>
        </article>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <div className="flex justify-center gap-6">
            <Link href="/privacy" className="hover:text-gray-700">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-700">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-gray-700">
              Cookie Policy
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
