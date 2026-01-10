import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Home, FileText } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/home")}
        >
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="bg-slate-900 text-white w-9 h-9 rounded-lg flex items-center justify-center"
          >
            <span className="font-bold text-base">R</span>
          </motion.div>
          <span className="font-semibold text-lg tracking-tight text-slate-900">
            ReadmeAI
          </span>
        </motion.div>

        {/* Navigation & User Menu */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              whileHover={{ backgroundColor: "rgb(248 250 252)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/home")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                location.pathname === "/home" 
                  ? "bg-slate-100 text-slate-900" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Home size={16} strokeWidth={2} />
              <span>Repositories</span>
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: "rgb(248 250 252)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/profile")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                location.pathname === "/profile" 
                  ? "bg-slate-100 text-slate-900" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText size={16} strokeWidth={2} />
              <span>Active Repos</span>
            </motion.button>
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {user?.avatarUrl ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 hover:border-slate-300 transition-all"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.githubUsername || "User"}
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-slate-900 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-800 transition-all"
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
                  className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.githubUsername || "User"}
                          className="w-11 h-11 rounded-full border-2 border-slate-200"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center">
                          <User size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user?.githubUsername || "User"}
                        </p>
                        <p className="text-xs text-slate-500">
                          GitHub Account
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
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
    </nav>
  );
};

export default AuthNavigation;

