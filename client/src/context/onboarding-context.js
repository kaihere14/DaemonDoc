import { createContext, useContext } from "react";

export const OnboardingContext = createContext(null);

// Null outside the dashboard layout, so shared controls can call
// `useOnboarding()?.refresh()` without caring where they are mounted.
export const useOnboarding = () => useContext(OnboardingContext);
