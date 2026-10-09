import React from "react";
import { Outlet } from "react-router-dom";
import AuthNavigation from "./AuthNavigation";
import { OnboardingProvider } from "../../context/OnboardingContext";
import OnboardingChecklist from "../onboarding/OnboardingChecklist";

/**
 * Wraps every signed-in dashboard route so the navbar stays mounted while the
 * page under it swaps. Rendering it per page remounted it on each navigation,
 * which replayed its entrance animation and made switching tabs feel jittery.
 * The onboarding checklist lives here for the same reason: it follows the user
 * from page to page without reloading its state.
 */
const DashboardLayout = () => (
  <OnboardingProvider>
    <AuthNavigation />
    <Outlet />
    <OnboardingChecklist />
  </OnboardingProvider>
);

export default DashboardLayout;
