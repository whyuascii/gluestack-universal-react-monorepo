"use client";

/**
 * AuthNavbar (Web) - Navigation for auth pages styled like PublicNavbar
 *
 * Features:
 * - Logo + App name on left (like PublicNavbar)
 * - Language switcher dropdown on right
 * - Optional back button
 * - Clean, minimal design
 *
 * THEME: Uses semantic Tailwind classes from @app/tailwind-config themes.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";

export interface AuthNavbarProps {
  /** Show back button */
  showBack?: boolean;
  /** Back button handler */
  onBack?: () => void;
  /** Logo text (single letter) */
  logoText?: string;
  /** Show language switcher */
  showLanguageSwitcher?: boolean;
  /** Navigate to home */
  onNavigateToHome?: () => void;
}

export const AuthNavbar: React.FC<AuthNavbarProps> = ({
  showBack = false,
  onBack,
  logoText = "A",
  showLanguageSwitcher = true,
  onNavigateToHome,
}) => {
  const { t } = useTranslation("common");

  return (
    <nav className="relative z-50 px-6 py-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        {/* Left: Logo */}
        <button
          onClick={onNavigateToHome || onBack}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          {showBack && (
            <svg
              className="w-5 h-5 text-typography-500 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          )}
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-typography-0 font-bold text-xl shadow-sm">
            {logoText}
          </div>
          <span className="text-2xl font-bold text-typography-900">{t("app.name")}</span>
        </button>

        {/* Right: Language switcher */}
        <div className="flex items-center gap-4">
          {showLanguageSwitcher && <LanguageSwitcher />}
        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar;
