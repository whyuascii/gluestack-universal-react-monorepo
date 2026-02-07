/**
 * PostHog Survey Hook (Web)
 *
 * Hook for working with PostHog surveys on web.
 * Surveys must be enabled in your PostHog project settings.
 *
 * Usage:
 *   const { surveys, activeSurvey, getSurvey } = usePostHogSurvey();
 */

import posthog from "posthog-js";
import { useCallback, useEffect, useState } from "react";

export interface Survey {
  id: string;
  name: string;
  description?: string;
  type: "popover" | "widget" | "link" | "api";
  questions: SurveyQuestion[];
  appearance?: Record<string, unknown>;
  conditions?: Record<string, unknown>;
  start_date?: string;
  end_date?: string;
}

export interface SurveyQuestion {
  type: "open" | "multiple_choice" | "single_choice" | "rating" | "link";
  question: string;
  description?: string;
  choices?: string[];
  required?: boolean;
}

export interface UsePostHogSurveyResult {
  /** All available surveys for current user */
  surveys: Survey[];
  /** Currently active survey (if any) */
  activeSurvey: Survey | null;
  /** Loading state */
  isLoading: boolean;
  /** Get a specific survey by ID */
  getSurvey: (surveyId: string) => Survey | undefined;
  /** Capture a survey response */
  captureSurveyResponse: (surveyId: string, response: Record<string, unknown>) => void;
  /** Capture survey shown event */
  captureSurveyShown: (surveyId: string) => void;
  /** Capture survey dismissed event */
  captureSurveyDismissed: (surveyId: string) => void;
  /** Reload surveys from PostHog */
  reloadSurveys: () => void;
}

/**
 * Hook for working with PostHog surveys
 *
 * Note: Surveys must be enabled in PostHog project settings.
 * For popover surveys, PostHog handles display automatically.
 * Use this hook for custom survey UIs or API-based surveys.
 */
export function usePostHogSurvey(): UsePostHogSurveyResult {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Get surveys from PostHog
    const loadSurveys = () => {
      setIsLoading(true);
      posthog.getActiveMatchingSurveys((matchingSurveys) => {
        setSurveys(matchingSurveys as unknown as Survey[]);
        // Set first matching survey as active
        if (matchingSurveys.length > 0) {
          setActiveSurvey(matchingSurveys[0] as unknown as Survey);
        }
        setIsLoading(false);
      }, true);
    };

    loadSurveys();
  }, []);

  const getSurvey = useCallback(
    (surveyId: string): Survey | undefined => {
      return surveys.find((s) => s.id === surveyId);
    },
    [surveys]
  );

  const captureSurveyResponse = useCallback(
    (surveyId: string, response: Record<string, unknown>) => {
      if (typeof window === "undefined") return;

      posthog.capture("survey sent", {
        $survey_id: surveyId,
        ...response,
      });
    },
    []
  );

  const captureSurveyShown = useCallback((surveyId: string) => {
    if (typeof window === "undefined") return;

    posthog.capture("survey shown", {
      $survey_id: surveyId,
    });
  }, []);

  const captureSurveyDismissed = useCallback((surveyId: string) => {
    if (typeof window === "undefined") return;

    posthog.capture("survey dismissed", {
      $survey_id: surveyId,
    });
  }, []);

  const reloadSurveys = useCallback(() => {
    if (typeof window === "undefined") return;

    setIsLoading(true);
    posthog.getActiveMatchingSurveys((matchingSurveys) => {
      setSurveys(matchingSurveys as unknown as Survey[]);
      if (matchingSurveys.length > 0) {
        setActiveSurvey(matchingSurveys[0] as unknown as Survey);
      } else {
        setActiveSurvey(null);
      }
      setIsLoading(false);
    }, true);
  }, []);

  return {
    surveys,
    activeSurvey,
    isLoading,
    getSurvey,
    captureSurveyResponse,
    captureSurveyShown,
    captureSurveyDismissed,
    reloadSurveys,
  };
}
