import { HStack, Button, ButtonText } from "@app/components";
import React from "react";
import { useTranslation } from "react-i18next";

// Type for PostHog on window object
interface WindowWithPostHog {
  posthog?: {
    capture: (event: string, properties?: Record<string, unknown>) => void;
  };
}

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
  ];

  const changeLanguage = (langCode: string) => {
    const previousLanguage = i18n.language;
    i18n.changeLanguage(langCode);

    // Track language change if analytics is available
    const w = (globalThis as any).window as WindowWithPostHog | undefined;
    if (w?.posthog) {
      w.posthog.capture("language_changed", {
        from_language: previousLanguage,
        to_language: langCode,
      });
    }
  };

  return (
    <HStack space="sm">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          onPress={() => changeLanguage(lang.code)}
          className={`px-3 py-1.5 rounded-md ${
            i18n.language === lang.code
              ? "bg-primary-600"
              : "bg-transparent border border-outline-300"
          }`}
        >
          <ButtonText
            className={`text-sm ${
              i18n.language === lang.code ? "text-white font-semibold" : "text-typography-700"
            }`}
          >
            {lang.label}
          </ButtonText>
        </Button>
      ))}
    </HStack>
  );
};
