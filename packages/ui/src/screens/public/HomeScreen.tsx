"use client";

/**
 * HomeScreen - Landing page for web (public, unauthenticated)
 *
 * This is the marketing/landing page shown to unauthenticated users.
 * Web-only - mobile users go directly to auth screens.
 */

// Declare window for web platform (not available in React Native types)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: any;

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { client } from "../../api";
import { PublicNavbar } from "../../navigation";

interface HomeScreenProps {
  onNavigateToSignup?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToFeatures?: () => void;
  onNavigateToPricing?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToSignup,
  onNavigateToLogin,
  onNavigateToFeatures,
  onNavigateToPricing,
  onNavigateToAbout,
  onNavigateToPrivacy,
  onNavigateToTerms,
}) => {
  const { t } = useTranslation("common");
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await client.public.waitlist.signup({ email });
      setIsSubmitted(true);
      setEmail("");
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || t("errors.waitlistFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { key: "auth", icon: "🔐" },
    { key: "database", icon: "🗄️" },
    { key: "crossPlatform", icon: "📱" },
    { key: "analytics", icon: "📊" },
    { key: "subscriptions", icon: "💳" },
    { key: "notifications", icon: "🔔" },
  ];

  const pricingTiers = ["free", "pro", "enterprise"];

  return (
    <div className="min-h-screen bg-surface-canvas font-sans text-content overflow-x-hidden selection:bg-primary-500 selection:text-white">
      {/* Navigation */}
      <PublicNavbar
        onNavigateToHome={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onNavigateToFeatures={onNavigateToFeatures}
        onNavigateToPricing={onNavigateToPricing}
        onNavigateToAbout={onNavigateToAbout}
        onNavigateToLogin={onNavigateToLogin}
        onNavigateToSignup={onNavigateToSignup}
      />

      {/* Hero Section */}
      <header className="relative z-10 px-6 pt-12 pb-24 md:pt-20 md:pb-32 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-block px-4 py-2 bg-primary-100 rounded-full text-primary-700 font-semibold mb-6">
            {t("hero.badge")}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-content-emphasis mb-6 leading-tight">
            {t("hero.title.line1")}{" "}
            <span className="text-primary-500">{t("hero.title.highlight")}</span>{" "}
            {t("hero.title.line2")}
          </h1>
          <p className="text-xl text-content-muted mb-10 max-w-2xl leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={onNavigateToSignup}
              className="bg-primary-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              {t("actions.getStartedFree")}
            </button>
            <a
              href="#features"
              className="px-8 py-4 rounded-full font-bold text-lg border-2 border-outline-200 text-content-emphasis hover:bg-surface-sunken transition-colors"
            >
              {t("actions.learnMore")}
            </a>
          </div>

          {/* Waitlist Form */}
          <div className="w-full max-w-md">
            {!isSubmitted ? (
              <>
                <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail((e.target as unknown as { value: string }).value)}
                    placeholder={t("hero.waitlist.placeholder")}
                    required
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-full border-2 border-outline-200 bg-surface text-content placeholder:text-content-muted focus:outline-none focus:border-primary-500 transition-colors shadow-sm disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-secondary-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-secondary-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? t("hero.waitlist.submitting") : t("hero.waitlist.button")}
                  </button>
                </form>
                {error && (
                  <div className="mt-3 bg-error-50 border border-error-200 rounded-xl px-4 py-2">
                    <p className="text-error-700 text-sm">{error}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-success-50 border border-success-200 rounded-xl px-4 py-3">
                <p className="text-success-700 font-medium">{t("hero.waitlist.success")}</p>
              </div>
            )}
            <p className="mt-3 text-sm text-content-muted">{t("hero.waitlist.disclaimer")}</p>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-content-emphasis mb-4">
              {t("features.title")}
            </h2>
            <p className="text-xl text-content-muted">{t("features.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.key}
                className="bg-surface-canvas p-8 rounded-2xl border border-outline-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center text-3xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-content-emphasis mb-3">
                  {t(`features.${feature.key}.title`)}
                </h3>
                <p className="text-content-muted leading-relaxed">
                  {t(`features.${feature.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 bg-surface-canvas">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-content-emphasis mb-4">
              {t("pricing.title")}
            </h2>
            <p className="text-xl text-content-muted">{t("pricing.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => {
              const isPro = tier === "pro";
              return (
                <div
                  key={tier}
                  className={`rounded-2xl p-8 ${
                    isPro
                      ? "bg-primary-500 text-white ring-4 ring-primary-200 scale-105"
                      : "bg-surface border border-outline-100"
                  }`}
                >
                  <h3
                    className={`text-xl font-bold mb-2 ${isPro ? "text-white" : "text-content-emphasis"}`}
                  >
                    {t(`pricing.${tier}.title`)}
                  </h3>
                  <p
                    className={`text-sm mb-4 ${isPro ? "text-primary-100" : "text-content-muted"}`}
                  >
                    {t(`pricing.${tier}.description`)}
                  </p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span
                      className={`text-4xl font-bold ${isPro ? "text-white" : "text-content-emphasis"}`}
                    >
                      {t(`pricing.${tier}.price`)}
                    </span>
                    {t(`pricing.${tier}.period`) && (
                      <span
                        className={`text-sm ${isPro ? "text-primary-100" : "text-content-muted"}`}
                      >
                        /{t(`pricing.${tier}.period`)}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {(t(`pricing.${tier}.features`, { returnObjects: true }) as string[]).map(
                      (feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <svg
                            className={`w-5 h-5 ${isPro ? "text-primary-200" : "text-success-500"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className={isPro ? "text-white" : "text-content"}>{feature}</span>
                        </li>
                      )
                    )}
                  </ul>
                  <button
                    onClick={onNavigateToSignup}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      isPro
                        ? "bg-white text-primary-600 hover:bg-primary-50"
                        : "bg-primary-500 text-white hover:bg-primary-600"
                    }`}
                  >
                    {t(`pricing.${tier}.cta`)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-24 bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-content-emphasis mb-4">
              {t("about.title")}
            </h2>
            <p className="text-xl text-content-muted">{t("about.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-primary-50 p-8 rounded-2xl">
              <p className="text-lg text-content leading-relaxed">{t("about.intro.paragraph1")}</p>
            </div>
            <div className="bg-surface-canvas p-8 rounded-2xl border border-outline-100">
              <p className="text-lg text-content leading-relaxed">{t("about.intro.paragraph2")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(
              t("about.benefits", { returnObjects: true }) as Record<
                string,
                { title: string; description: string }
              >
            )
              .filter(([key]) => key !== "title")
              .map(([key, benefit]) => (
                <div
                  key={key}
                  className="bg-surface-canvas p-6 rounded-xl border border-outline-100 text-center"
                >
                  <h4 className="font-bold text-content-emphasis mb-2">{benefit.title}</h4>
                  <p className="text-sm text-content-muted">{benefit.description}</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto bg-primary-500 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full translate-x-1/3 translate-y-1/3"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{t("cta.title")}</h2>
            <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">{t("cta.subtitle")}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onNavigateToSignup}
                className="bg-white text-primary-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-primary-50 transition-colors"
              >
                {t("actions.getStartedFree")}
              </button>
              <button
                onClick={onNavigateToLogin}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors"
              >
                {t("actions.login")}
              </button>
            </div>

            <p className="mt-6 text-white/70 text-sm">{t("cta.waitlist.disclaimer")}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-content-emphasis text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="text-2xl font-bold">{t("app.name")}</span>
              </div>
              <p className="text-white/60">{t("footer.tagline")}</p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">{t("footer.product")}</h4>
              <ul className="space-y-3 text-white/70">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    {t("navigation.features")}
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    {t("navigation.pricing")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("navigation.docs")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">{t("footer.company")}</h4>
              <ul className="space-y-3 text-white/70">
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    {t("navigation.about")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("navigation.blog")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("navigation.contact")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">{t("footer.legal")}</h4>
              <ul className="space-y-3 text-white/70">
                <li>
                  <a
                    href="/privacy"
                    onClick={(e) => {
                      if (onNavigateToPrivacy) {
                        e.preventDefault();
                        onNavigateToPrivacy();
                      }
                    }}
                    className="hover:text-white transition-colors"
                  >
                    {t("footer.privacy")}
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    onClick={(e) => {
                      if (onNavigateToTerms) {
                        e.preventDefault();
                        onNavigateToTerms();
                      }
                    }}
                    className="hover:text-white transition-colors"
                  >
                    {t("footer.terms")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-white/40 text-sm">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;
