import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./lib/pages/Login";
import OauthVerify from "./lib/pages/OauthVerify";
import Home from "./lib/pages/Home";
import Profile from "./lib/pages/Profile";
import Logs from "./lib/pages/Logs";
import Admin from "./lib/pages/Admin";
import DashboardLayout from "./components/common/DashboardLayout";
import { MARKETING_URL } from "./lib/urls";

/**
 * This app is the dashboard (app.daemondoc.online); the landing page lives on
 * the apex domain. Anyone hitting the app root gets sent there.
 */
const MarketingRedirect = () => {
  React.useEffect(() => {
    window.location.replace(MARKETING_URL);
  }, []);
  return null;
};

const App = () => {
  return (
    <div>
      <Toaster
        position="bottom-right"
        richColors
        closeButton={false}
        duration={3500}
        toastOptions={{
          classNames: {
            toast: "select-none",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<MarketingRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth-success" element={<OauthVerify />} />
        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
