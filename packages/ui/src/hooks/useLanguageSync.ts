/**
 * Language Sync Hook
 *
 * Syncs the user's preferred language from the database when they log in.
 * Priority:
 * 1. User preference from database (if logged in and preference exists)
 * 2. Local storage/AsyncStorage preference (already handled by i18next detectors)
 * 3. Browser/device language (already handled by i18next detectors)
 * 4. Default English (fallback)
 */

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMe } from "./queries/useMe";

interface UseLanguageSyncOptions {
  enabled?: boolean;
}

export function useLanguageSync(options: UseLanguageSyncOptions = {}) {
  const { enabled = true } = options;
  const { i18n } = useTranslation();
  const { data: userData, isSuccess } = useMe({ enabled });
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once per session and when user data is available
    if (!isSuccess || !userData?.user || hasSynced.current) {
      return;
    }

    const preferredLanguage = userData.user.preferredLanguage;

    // If user has a saved preference and it differs from current, apply it
    if (preferredLanguage && preferredLanguage !== i18n.language) {
      i18n.changeLanguage(preferredLanguage);
    }

    hasSynced.current = true;
  }, [isSuccess, userData, i18n]);

  // Reset sync flag if user changes (e.g., logout/login with different account)
  useEffect(() => {
    const userId = userData?.user?.id;
    return () => {
      // Reset on unmount or user change
      if (!userId) {
        hasSynced.current = false;
      }
    };
  }, [userData?.user?.id]);

  return {
    currentLanguage: i18n.language,
    preferredLanguage: userData?.user?.preferredLanguage,
    isLoggedIn: !!userData?.user,
  };
}
