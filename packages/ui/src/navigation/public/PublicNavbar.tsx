"use client";

/**
 * PublicNavbar - Top navigation for public/marketing pages (web-only)
 *
 * Features:
 * - Logo + App name
 * - Navigation links (Features, Pricing, About)
 * - Login/Signup buttons
 * - Responsive: hamburger menu on mobile
 *
 * THEME: Uses semantic Tailwind classes from @app/tailwind-config themes.
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import type { PublicNavProps } from "../types";

export interface PublicNavbarProps extends PublicNavProps {
  /** Logo text (single letter or short text) */
  logoText?: string;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  activeRoute,
  onNavigateToHome,
  onNavigateToFeatures,
  onNavigateToPricing,
  onNavigateToAbout,
  onNavigateToLogin,
  onNavigateToSignup,
  logoText = "A",
}) => {
  const { t } = useTranslation("common");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      key: "features",
      label: t("navigation.features"),
      onClick: onNavigateToFeatures,
      href: "#features",
    },
    {
      key: "pricing",
      label: t("navigation.pricing"),
      onClick: onNavigateToPricing,
      href: "#pricing",
    },
    { key: "about", label: t("navigation.about"), onClick: onNavigateToAbout, href: "#about" },
  ];

  return (
    <nav className="relative z-50 px-6 py-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <button
          onClick={onNavigateToHome}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-typography-0 font-bold text-xl shadow-sm">
            {logoText}
          </div>
          <span className="text-2xl font-bold text-typography-900">{t("app.name")}</span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              onClick={(e) => {
                if (link.onClick) {
                  e.preventDefault();
                  link.onClick();
                }
              }}
              className={`text-typography-700 hover:text-primary-500 transition-colors font-medium ${
                activeRoute === link.key ? "text-primary-500" : ""
              }`}
            >
              {link.label}
            </a>
          ))}
          <LanguageSwitcher />
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToLogin}
              className="px-5 py-2 rounded-lg border border-outline-200 text-typography-900 font-medium hover:bg-background-50 transition-colors"
            >
              {t("actions.login")}
            </button>
            <button
              onClick={onNavigateToSignup}
              className="px-5 py-2 rounded-lg bg-primary-500 text-typography-0 font-medium hover:bg-primary-600 transition-colors"
            >
              {t("actions.signup")}
            </button>
          </div>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-background-50 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 py-4 border-t border-outline-100">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  }
                  setIsMobileMenuOpen(false);
                }}
                className={`text-typography-700 hover:text-primary-500 transition-colors font-medium py-2 ${
                  activeRoute === link.key ? "text-primary-500" : ""
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-outline-100">
              <button
                onClick={() => {
                  onNavigateToLogin?.();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-5 py-2.5 rounded-lg border border-outline-200 text-typography-900 font-medium hover:bg-background-50 transition-colors"
              >
                {t("actions.login")}
              </button>
              <button
                onClick={() => {
                  onNavigateToSignup?.();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-5 py-2.5 rounded-lg bg-primary-500 text-typography-0 font-medium hover:bg-primary-600 transition-colors"
              >
                {t("actions.signup")}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
