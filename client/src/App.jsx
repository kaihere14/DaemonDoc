import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import OauthVerify from "./pages/OauthVerify";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Logs from "./pages/Logs";
import { Analytics } from "@vercel/analytics/react";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth-success" element={<OauthVerify />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
      <Analytics />
    </div>
  );
};

export default App;
