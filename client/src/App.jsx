import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./lib/pages/Login";
import OauthVerify from "./lib/pages/OauthVerify";
import Landing from "./lib/pages/Landing";
import Home from "./lib/pages/Home";
import Profile from "./lib/pages/Profile";
import Logs from "./lib/pages/Logs";
import Admin from "./lib/pages/Admin";
import Upgrade from "./lib/pages/Upgrade";

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
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth-success" element={<OauthVerify />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/upgrade" element={<Upgrade />} />
      </Routes>
    </div>
  );
};

export default App;
