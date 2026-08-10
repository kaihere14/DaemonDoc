import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Home, Activity, Menu, X, Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePostHog } from "@posthog/react";

import { MARKETING_URL } from "@/lib/urls";

const AuthNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const posthog = usePostHog();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    // A menu you can open with the keyboard has to be closable with it too.
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setShowDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    posthog?.capture("user_logged_out");
    posthog?.reset();
    logout();
    setShowDropdown(false);
    window.location.href = MARKETING_URL;
  };

  return (
    <nav
      aria-label="Main"
      className="fixed top-0 right-0 left-0 z-50 bg-linear-to-t from-white/10 via-white/60 to-white/95 backdrop-blur-md backdrop-saturate-150"
    >
      {/* Same container as the page content below it, so the logo and the page
          heading share a left edge instead of missing it by ~85px. */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <a
          href={MARKETING_URL}
          aria-label="DaemonDoc home"
          className="flex shrink-0 cursor-pointer items-center rounded-lg"
        >
          {/* The cropped 406x120 asset — DaemonLogo.png is a mostly-transparent
              1536x1024 canvas, which is what the scale-120 hack compensated for. */}
          <img
            src="/DaemonLogo-nav.png"
            alt="DaemonDoc"
            width={406}
            height={120}
            className="h-8 w-auto sm:h-9"
          />
        </a>

        {/* Navigation & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label={showMobileMenu ? "Close menu" : "Open menu"}
            aria-expanded={showMobileMenu}
            aria-controls="dashboard-mobile-menu"
            className="cursor-pointer rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 md:hidden"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </motion.button>

          {/* Navigation Links - Desktop */}
          <div className="hidden items-center gap-2 md:flex">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/home")}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                location.pathname === "/home"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Home size={16} strokeWidth={2} />
              <span>Repositories</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/logs")}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === "/logs"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Activity size={16} strokeWidth={2} />
              <span>Activity Logs</span>
            </motion.button>
            {user?.admin && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/admin")}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  location.pathname === "/admin"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Shield size={16} strokeWidth={2} />
                <span>Admin</span>
              </motion.button>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {user?.avatarUrl ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={showDropdown}
                className="h-9 w-9 cursor-pointer overflow-hidden rounded-full border-2 border-slate-200 transition-colors hover:border-slate-300"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.githubUsername || "User"}
                  className="h-full w-full object-cover"
                />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={showDropdown}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-white transition-colors hover:bg-slate-800"
              >
                <User size={16} strokeWidth={2} />
              </motion.button>
            )}

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  role="menu"
                  // Anchored to the avatar that opened it, so the popover grows
                  // out of its trigger rather than from its own centre.
                  style={{ transformOrigin: "top right" }}
                  className="rounded-tile shadow-overlay absolute right-0 mt-3 w-64 overflow-hidden border border-slate-200 bg-white"
                >
                  <div className="border-b border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.githubUsername || "User"}
                          className="h-11 w-11 rounded-full border-2 border-slate-200"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white">
                          <User size={20} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {user?.githubUsername || "User"}
                        </p>
                        <p className="text-xs text-slate-500">GitHub Account</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowDropdown(false);
                    }}
                    role="menuitem"
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <User size={15} strokeWidth={2} />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <LogOut size={15} strokeWidth={2} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            id="dashboard-mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-200/50 bg-white/90 backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigate("/home");
                  setShowMobileMenu(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  location.pathname === "/home"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Home size={18} strokeWidth={2} />
                <span>Repositories</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigate("/logs");
                  setShowMobileMenu(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  location.pathname === "/logs"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Activity size={18} strokeWidth={2} />
                <span>Activity Logs</span>
              </motion.button>

              {user?.admin && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate("/admin");
                    setShowMobileMenu(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    location.pathname === "/admin"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Shield size={18} strokeWidth={2} />
                  <span>Admin</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default AuthNavigation;
