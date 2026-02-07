import { HStack, Button, ButtonText } from "@app/components";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAnalytics } from "../analytics";
import { useUpdateLanguagePreference } from "../hooks/mutations/useSettings";
import { useMe } from "../hooks/queries/useMe";
import type { SupportedLanguage } from "@app/core-contract";

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const { track } = useAnalytics();
  const { data: userData } = useMe({ enabled: true });
  const updateLanguageMutation = useUpdateLanguagePreference();

  const languages = [
    { code: "en" as SupportedLanguage, label: "English" },
    { code: "es" as SupportedLanguage, label: "Español" },
  ];

  const changeLanguage = (langCode: SupportedLanguage) => {
    const previousLanguage = i18n.language;

    // Update i18n (which caches to localStorage/AsyncStorage)
    i18n.changeLanguage(langCode);

    // If user is logged in, persist to database
    if (userData?.user) {
      updateLanguageMutation.mutate({ language: langCode });
    }

    // Track language change via analytics abstraction
    track("language_changed", {
      from_language: previousLanguage,
      to_language: langCode,
    });
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
              i18n.language === lang.code
                ? "text-typography-0 font-semibold"
                : "text-typography-700"
            }`}
          >
            {lang.label}
          </ButtonText>
        </Button>
      ))}
    </HStack>
  );
};
