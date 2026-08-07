import React from "react";
import { Outlet } from "react-router-dom";
import AuthNavigation from "./AuthNavigation";

/**
 * Wraps every signed-in dashboard route so the navbar stays mounted while the
 * page under it swaps. Rendering it per page remounted it on each navigation,
 * which replayed its entrance animation and made switching tabs feel jittery.
 */
const DashboardLayout = () => (
  <>
    <AuthNavigation />
    <Outlet />
  </>
);

export default DashboardLayout;
