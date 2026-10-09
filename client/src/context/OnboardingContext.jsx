import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePostHog } from "@posthog/react";
import { api, ENDPOINTS } from "../lib/api";
import { useAuth } from "./auth-context";
import { OnboardingContext } from "./onboarding-context";

// While the first README is on its way the checklist polls, because the log
// row it waits for is written by the worker, not by anything on this page.
const FIRST_README_POLL_MS = 5000;

const INACTIVE = { active: false };

const SNOOZE_EVENTS = { snoozed: true, resumed: false };

export const OnboardingProvider = ({ children }) => {
  const { user } = useAuth();
  const posthog = usePostHog();
  const userId = user?._id;
  // Accounts created before onboarding shipped have no startedAt and never
  // need the request at all.
  const enrolled = Boolean(user?.onboarding?.startedAt);
  const [onboarding, setOnboarding] = useState(null);
  const shownRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!userId || !enrolled) return;
    try {
      const { data } = await api.get(ENDPOINTS.ONBOARDING);
      setOnboarding(data.onboarding);
    } catch {
      // A broken checklist must never block the dashboard; hide it instead.
      setOnboarding((current) => current ?? INACTIVE);
    }
  }, [userId, enrolled]);

  useEffect(() => {
    if (!userId || !enrolled) return undefined;
    let cancelled = false;

    void (async () => {
      try {
        const { data } = await api.get(ENDPOINTS.ONBOARDING);
        if (!cancelled) setOnboarding(data.onboarding);
      } catch {
        if (!cancelled) setOnboarding(INACTIVE);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, enrolled]);

  // Folding and reopening only move the panel, so they show straight away and
  // roll back if the server disagrees.
  const sendEvent = useCallback(
    async (event) => {
      const optimisticSnooze = SNOOZE_EVENTS[event];
      if (optimisticSnooze !== undefined) {
        setOnboarding((current) =>
          current?.active ? { ...current, snoozed: optimisticSnooze } : current,
        );
      }

      try {
        const { data } = await api.patch(ENDPOINTS.ONBOARDING, { event });
        setOnboarding(data.onboarding);
        posthog?.capture(`onboarding_${event}`);
        return data.onboarding;
      } catch (error) {
        if (optimisticSnooze !== undefined) {
          setOnboarding((current) =>
            current?.active
              ? { ...current, snoozed: !optimisticSnooze }
              : current,
          );
        }
        throw error;
      }
    },
    [posthog],
  );

  // Lets a step the user just finished tick over without waiting for the
  // next fetch; the refresh that follows confirms it.
  const markStepDone = useCallback((step, patch = {}) => {
    setOnboarding((current) =>
      current?.active
        ? { ...current, ...patch, steps: { ...current.steps, [step]: true } }
        : current,
    );
  }, []);

  const waitingForFirstReadme =
    onboarding?.active &&
    onboarding.steps.firstRepo &&
    !onboarding.steps.firstReadme;

  useEffect(() => {
    if (!waitingForFirstReadme) return undefined;
    const interval = setInterval(() => void refresh(), FIRST_README_POLL_MS);
    return () => clearInterval(interval);
  }, [waitingForFirstReadme, refresh]);

  useEffect(() => {
    if (onboarding?.active && !shownRef.current) {
      shownRef.current = true;
      posthog?.capture("onboarding_shown", { snoozed: onboarding.snoozed });
    }
  }, [onboarding, posthog]);

  const value = useMemo(
    () => ({
      onboarding: enrolled ? onboarding : INACTIVE,
      enrolled,
      refresh,
      sendEvent,
      markStepDone,
    }),
    [onboarding, enrolled, refresh, sendEvent, markStepDone],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
