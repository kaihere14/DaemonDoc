import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import OauthVerify from "./pages/OauthVerify";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Logs from "./pages/Logs";

const App = () => {
  return (
    <div>
      <Toaster position="bottom-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth-success" element={<OauthVerify />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </div>
  );
};

export default App;
