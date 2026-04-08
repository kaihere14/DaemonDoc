import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogOut,
  Home,
  Activity,
  Menu,
  X,
  Shield,
  Zap,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 mx-auto max-w-[1450px] bg-linear-to-t from-white/10 via-white/50 to-white/95 backdrop-blur-xs">
      <div className="flex h-16 items-center justify-between pr-4 sm:pr-20 sm:pl-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="group flex w-40 cursor-pointer items-center gap-2 overflow-hidden sm:w-60 sm:gap-3"
          onClick={() => navigate("/")}
        >
          <motion.div>
            <img
              src="/DaemonLogo.png"
              alt="DaemonDoc Logo"
              className="w-40 scale-120 pt-1 sm:ml-2 sm:w-48"
            />
          </motion.div>
        </motion.div>

        {/* Navigation & User Menu */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="rounded-lg p-2 text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 md:hidden"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </motion.button>

          {/* Upgrade pill — shown only for free plan users */}
          {user && user.plan !== "pro" && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/upgrade")}
              className="hidden cursor-pointer items-center gap-1.5 rounded-full bg-[#1d4ed8] px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-[#1e40af] md:flex"
            >
              <Zap size={11} />
              Upgrade
            </motion.button>
          )}

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
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
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
                className="h-9 w-9 cursor-pointer overflow-hidden rounded-full border-2 border-slate-200 transition-all hover:border-slate-300"
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
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition-all hover:bg-slate-800"
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
                  className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
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
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <User size={15} strokeWidth={2} />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <LogOut size={15} strokeWidth={2} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-200/50 bg-white/80 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
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

              {user && user.plan !== "pro" && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate("/upgrade");
                    setShowMobileMenu(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition-all hover:bg-blue-100"
                >
                  <Zap size={18} strokeWidth={2} />
                  <span>Upgrade to Pro</span>
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
