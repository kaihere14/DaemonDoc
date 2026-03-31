import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import OauthVerify from "./pages/OauthVerify";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Logs from "./pages/Logs";
import Admin from "./pages/Admin";
import Upgrade from "./pages/Upgrade";

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
