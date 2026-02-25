import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Github,
  Zap,
  ExternalLink,
  Settings,
  ChevronRight,
  Power,
  Clock,
  TrendingUp,
  AlertTriangle,
  Check,
  RefreshCw,
} from "lucide-react";
import AuthNavigation from "../components/AuthNavigation";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { useRepos } from "../hooks/useRepos";
import { api, ENDPOINTS } from "../lib/api";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useRequireAuth();
  const { repos, loading: statsLoading } = useRepos(user);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Delete handle function
  const HandleDelete = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete") return;
    setIsDeleting(true);
    try {
      await api.delete(ENDPOINTS.AUTH_DELETE);
      localStorage.removeItem("accessToken");
      navigate("/");
    } catch {
      console.log("Error deleting account");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmText("");
    }
  };

  // Compute active repos count
  const activeReposCount = statsLoading
    ? 0
    : repos.filter((r) => r.activated).length;
  const hasActiveRepos = activeReposCount > 0;

  // Show loading state while checking authentication
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">
            Loading your dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-50">
      <AuthNavigation />
      <div className="pt-24 pb-20 px-4 sm:px-6 max-w-5xl mx-auto">
        {/* SECTION 1: PROFILE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-[24px] p-6 sm:p-8 shadow-sm mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={user.avatarUrl}
                  alt={user.githubUsername}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-slate-200 object-cover"
                />
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-slate-900 rounded-full border-[3px] border-white flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {user.name || user.githubUsername}
                </h1>
                <p className="text-sm text-slate-500">@{user.githubUsername}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`https://github.com/${user.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                <Github size={16} />
                GitHub Profile
              </a>
              <button
                onClick={() => navigate("/home")}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-all"
              >
                <RefreshCw size={16} />
                Manage Repos
              </button>
            </div>
          </div>
        </motion.div>

        {/* SECTION 2: KEY METRICS - Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Repos */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200 p-5 rounded-[20px] shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
                <Github size={18} />
              </div>
              <TrendingUp size={14} className="text-slate-400" />
            </div>
            <p className="text-3xl font-black text-slate-900 leading-none mb-1">
              {statsLoading ? (
                <span className="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse" />
              ) : (
                repos.length
              )}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Repos
            </p>
          </motion.div>

          {/* Active AI Updates */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`border p-5 rounded-[20px] shadow-sm hover:shadow-md transition-all duration-200 ${
              hasActiveRepos
                ? "bg-slate-900 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-2 rounded-xl ${
                  hasActiveRepos
                    ? "bg-white text-slate-900"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Zap size={18} />
              </div>
              {hasActiveRepos && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-white/10 px-2 py-0.5 rounded-full">
                  <Check size={10} /> LIVE
                </span>
              )}
            </div>
            <p
              className={`text-3xl font-black leading-none mb-1 ${
                hasActiveRepos ? "text-white" : "text-slate-400"
              }`}
            >
              {statsLoading ? (
                <span className="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse" />
              ) : (
                activeReposCount
              )}
            </p>
            <p
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                hasActiveRepos ? "text-slate-400" : "text-slate-400"
              }`}
            >
              Active Updates
            </p>
          </motion.div>

          {/* Sync Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-200 p-5 rounded-[20px] shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
                <Clock size={18} />
              </div>
            </div>
            <p className="text-lg font-bold text-slate-900 leading-tight mb-1">
              {user.autoReadmeEnabled ? "Real-time" : "Paused"}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Sync Status
            </p>
          </motion.div>

          {/* Integration Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white border border-slate-200 p-5 rounded-[20px] shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <Github size={18} />
              </div>
              <span className="w-2 h-2 rounded-full bg-slate-900" />
            </div>
            <p className="text-lg font-bold text-slate-900 leading-tight mb-1">
              Connected
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              GitHub Status
            </p>
          </motion.div>
        </div>

        {/* SECTION 3: INTEGRATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Integrations Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Integrations
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 text-white rounded-lg">
                    <Github size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      GitHub
                    </p>
                    <p className="text-[11px] text-slate-400">
                      OAuth Connected
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                  <Check size={12} />
                  <span className="text-[10px] font-bold uppercase">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/home")}
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Github size={18} className="text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Repositories
                  </span>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
                />
              </button>
              <button
                onClick={() => navigate("/logs")}
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Activity Logs
                  </span>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
                />
              </button>
            </div>
          </motion.div>
        </div>

        {/* SECTION 4: SETTINGS - Account actions tucked away */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm"
        >
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-500 rounded-xl">
                <Settings size={18} />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                Account Settings
              </span>
            </div>
            <ChevronRight
              size={18}
              className={`text-slate-400 transition-transform duration-200 ${
                showSettings ? "rotate-90" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                  <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        size={18}
                        className="text-red-400 mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-red-800 mb-1">
                          Danger Zone
                        </h5>
                        <p className="text-xs text-red-600/80 mb-3">
                          Permanently delete your account and all associated
                          data. This action cannot be undone.
                        </p>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 underline underline-offset-2 transition-colors"
                        >
                          Delete my account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteConfirmText("");
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Delete Account
                </h3>
                <p className="text-slate-500 text-sm">
                  This action cannot be undone. All your data will be
                  permanently deleted.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Type <span className="text-red-600 font-bold">delete</span> to
                  confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type 'delete' here"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-slate-900"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText("");
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={HandleDelete}
                  disabled={
                    deleteConfirmText.toLowerCase() !== "delete" || isDeleting
                  }
                  className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                    deleteConfirmText.toLowerCase() === "delete" && !isDeleting
                      ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                      : "bg-red-200 text-red-400 cursor-not-allowed"
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
