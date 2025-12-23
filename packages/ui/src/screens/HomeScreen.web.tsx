"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError, signupForWaitlist } from "../api";
import {
  UsersIllustration,
  CalendarIllustration,
  ShapeDecoration,
  ListIllustration,
  ChartIllustration,
  SyncIllustration,
} from "../components/Illustrations";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

interface HomeScreenProps {
  onNavigateToSignup?: () => void;
  onNavigateToLogin?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = () => {
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
      await signupForWaitlist(email);
      setIsSubmitted(true);
      setEmail("");
    } catch (err) {
      if (err instanceof ApiError) {
        // Extract error message from API response
        if (err.data && typeof err.data === "object" && "error" in err.data) {
          const errorData = err.data as { error: { message: string } };
          setError(errorData.error.message);
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to join waitlist. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-700 overflow-x-hidden selection:bg-gray-400 selection:text-white">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <ShapeDecoration
          className="absolute top-20 left-10 w-24 h-24 animate-float"
          rotation={-15}
        />
        <ShapeDecoration
          className="absolute top-40 right-20 w-16 h-16 animate-float-delayed"
          rotation={45}
          color="#d1d5db"
        />
        <ShapeDecoration
          className="absolute bottom-20 left-1/4 w-32 h-32 animate-float-slow"
          rotation={10}
          color="#d1d5db"
        />
        <ShapeDecoration
          className="absolute top-1/2 right-10 w-20 h-20 animate-float"
          rotation={-30}
          color="#d1d5db"
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-6 max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">
            ICON
          </div>
          <span className="text-3xl font-bold text-gray-700">{t("app.name")}</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-gray-700 hover:text-gray-500 transition-colors font-semibold"
          >
            {t("navigation.features")}
          </a>
          <a
            href="#about"
            className="text-gray-700 hover:text-gray-500 transition-colors font-semibold"
          >
            {t("navigation.ourStory")}
          </a>
          <LanguageSwitcher />
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 px-6 pt-12 pb-24 md:pt-20 md:pb-32 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block px-4 py-2 bg-gray-200 rounded-full text-gray-700 font-bold mb-6 transform -rotate-2">
              {t("hero.badge")}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-700 mb-6 leading-tight">
              {t("hero.title.part1")}{" "}
              <span className="text-gray-500 relative inline-block">
                {t("hero.title.cozy")}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-gray-300 opacity-60"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>{" "}
              {t("hero.title.part2")}
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed">
              {t("hero.subtitle")}
            </p>

            {/* Waitlist Signup Form */}
            <div className="max-w-md mx-auto md:mx-0">
              {!isSubmitted ? (
                <>
                  <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("hero.waitlist.placeholder")}
                      required
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-4 rounded-full border-2 border-gray-300 bg-white text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gray-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? t("hero.waitlist.submitting") : t("hero.waitlist.button")}
                      {!isSubmitting && (
                        <svg
                          className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      )}
                    </button>
                  </form>
                  {error && (
                    <div className="mt-3 bg-error-50 border-2 border-error-500 rounded-2xl px-6 py-3 text-center">
                      <p className="text-error-700 font-semibold">{error}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-success-50 border-2 border-success-500 rounded-2xl px-6 py-4 text-center">
                  <p className="text-success-700 font-semibold">{t("hero.waitlist.success")}</p>
                </div>
              )}
              <p className="mt-4 text-sm text-gray-500 text-center md:text-left">
                {t("hero.waitlist.disclaimer")}
              </p>
            </div>
          </div>

          <div className="flex-1 relative w-full max-w-lg">
            <div className="absolute inset-0 bg-gray-200 rounded-full blur-3xl transform scale-90"></div>
            <ListIllustration className="w-full h-auto relative z-10 drop-shadow-xl animate-float-slow" />
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 bg-white/50 rounded-t-5xl -mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
              {t("features.title")}
            </h2>
            <p className="text-xl text-gray-600 text-2xl">{t("features.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: Chore Garden + Keep Nest Clean */}
            <div className="bg-gray-100 p-8 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 group">
              <div className="h-48 flex items-center justify-center mb-6 bg-white rounded-3xl group-hover:bg-gray-50 transition-colors">
                <ChartIllustration className="w-32 h-32" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">
                {t("features.choreGarden.title")}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-3">
                {t("features.choreGarden.description")}
              </p>
            </div>

            {/* Card 2: Calendar + Monthly Check-ins */}
            <div className="bg-gray-100 p-8 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 group">
              <div className="h-48 flex items-center justify-center mb-6 bg-white rounded-3xl group-hover:bg-gray-50 transition-colors">
                <CalendarIllustration className="w-32 h-32" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">
                {t("features.calendar.title")}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-3">
                {t("features.calendar.description")}
              </p>
            </div>

            {/* Card 3: Love Notes + Little Moments */}
            <div className="bg-gray-100 p-8 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 group">
              <div className="h-48 flex items-center justify-center mb-6 bg-white rounded-3xl group-hover:bg-gray-50 transition-colors">
                <UsersIllustration className="w-32 h-32" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">
                {t("features.loveNotes.title")}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-3">
                {t("features.loveNotes.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 bg-white/50">
        <div className="max-w-5xl mx-auto bg-gray-500 rounded-3xl p-12 md:p-24 text-center relative overflow-hidden shadow-lg">
          {/* Decorative background circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-400/20 rounded-full translate-x-1/3 translate-y-1/3"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">{t("cta.title")}</h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
              {t("cta.subtitle")}
            </p>

            {/* Waitlist Form */}
            {!isSubmitted ? (
              <div className="max-w-md mx-auto">
                <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("cta.waitlist.placeholder")}
                    required
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 rounded-full border-2 border-white/20 bg-white/90 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gray-300 text-gray-700 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-white transition-colors transform hover:scale-105 duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? t("hero.waitlist.submitting") : t("cta.waitlist.button")}
                  </button>
                </form>
                {error && (
                  <div className="mt-3 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-2xl px-6 py-3 text-center">
                    <p className="text-white font-semibold">{error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 max-w-md mx-auto">
                <p className="text-white font-semibold">{t("cta.waitlist.success")}</p>
              </div>
            )}
            <p className="mt-6 text-white/80 text-lg">{t("cta.waitlist.disclaimer")}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-700 text-white py-16 px-6 rounded-t-3xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-xl">
                ICON
              </div>
              <span className="text-3xl font-bold">{t("app.name")}</span>
            </div>
            <p className="text-white/60">{t("footer.tagline")}</p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-gray-300">{t("footer.product")}</h4>
            <ul className="space-y-4 text-white/70">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  {t("navigation.features")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("navigation.roadmap")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("navigation.testimonials")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-gray-300">{t("footer.company")}</h4>
            <ul className="space-y-4 text-white/70">
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
            <h4 className="font-bold text-lg mb-6 text-gray-300">{t("footer.connect")}</h4>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full hover:bg-gray-300 hover:text-gray-700 transition-colors cursor-pointer flex items-center justify-center">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full hover:bg-gray-300 hover:text-gray-700 transition-colors cursor-pointer flex items-center justify-center">
                <span className="sr-only">Instagram</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          {t("footer.copyright")}
        </div>
      </footer>
    </div>
  );
};
