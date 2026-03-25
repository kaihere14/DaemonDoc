import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Github,
  Zap,
  Settings,
  ChevronRight,
  Clock,
  TrendingUp,
  AlertTriangle,
  Check,
} from "lucide-react";
import AuthNavigation from "../components/AuthNavigation";
import SEO from "../components/SEO";
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

  const handleDelete = async () => {
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

  const activeReposCount = statsLoading
    ? 0
    : repos.filter((repo) => repo.activated).length;
  const privateReposCount = statsLoading
    ? 0
    : repos.filter((repo) => repo.private).length;
  const hasActiveRepos = activeReposCount > 0;

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white via-slate-50/70 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">
            Loading your profile...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Profile - DaemonDoc"
        description="Review your DaemonDoc account, GitHub connection, repository activity, and account settings."
      />
      <div className="min-h-screen overflow-x-hidden bg-linear-to-b from-white via-slate-50/70 to-white text-slate-900 font-sans selection:bg-blue-50">
        <AuthNavigation />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-24 left-[-8rem] h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute top-56 right-[-7rem] h-80 w-80 rounded-full bg-sky-100/45 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-10"
          >
            <div className="mb-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-1 w-8 rounded-full bg-blue-600" />
                  <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Profile System
                  </span>
                </div>
                <h1 className="mb-3 text-3xl font-black uppercase leading-none tracking-tighter text-slate-900 sm:text-5xl">
                  Account Profile
                </h1>
                <p className="max-w-2xl text-sm font-medium tracking-tight text-slate-500 sm:text-base">
                  Manage your GitHub connection, monitor repository coverage, and control account settings from the same operating surface as the rest of the app.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:rounded-[2rem] sm:p-8"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                <div className="relative shrink-0">
                  <img
                    src={user.avatarUrl}
                    alt={user.githubUsername}
                    className="h-16 w-16 rounded-full border-2 border-slate-200 object-cover sm:h-20 sm:w-20"
                  />
                  <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-white bg-blue-600">
                    <Check size={10} className="text-white" />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    Connected Identity
                  </p>
                  <h2 className="truncate text-xl font-black uppercase tracking-tight text-slate-900 sm:text-2xl">
                    {user.name || user.githubUsername}
                  </h2>
                  <p className="truncate text-sm text-slate-500">
                    @{user.githubUsername}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={`https://github.com/${user.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100"
                >
                  <Github size={16} />
                  GitHub Profile
                </a>
              </div>
            </div>
          </motion.div>

          <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[1.5rem] border border-slate-200/60 bg-white/90 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)] sm:rounded-[2rem] sm:p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-xl bg-slate-100 p-2 text-slate-500">
                  <Github size={18} />
                </div>
                <TrendingUp size={14} className="text-slate-400" />
              </div>
              <p className="mb-1 text-xl font-black text-slate-900 sm:text-2xl">
                {statsLoading ? (
                  <span className="inline-block h-6 w-8 animate-pulse rounded bg-slate-100 sm:h-8" />
                ) : (
                  repos.length
                )}
              </p>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                Total Repos
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`rounded-[1.5rem] border p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)] sm:rounded-[2rem] sm:p-5 ${
                hasActiveRepos
                  ? "border-blue-100 bg-blue-50/80"
                  : "border-slate-200/60 bg-white/90"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div
                  className={`rounded-xl p-2 ${
                    hasActiveRepos
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Zap size={18} />
                </div>
                {hasActiveRepos && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
                    Live
                  </span>
                )}
              </div>
              <p className={`mb-1 text-xl font-black sm:text-2xl ${
                hasActiveRepos ? "text-blue-700" : "text-slate-500"
              }`}>
                {statsLoading ? (
                  <span className="inline-block h-6 w-8 animate-pulse rounded bg-slate-100 sm:h-8" />
                ) : (
                  activeReposCount
                )}
              </p>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                Active Updates
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-[1.5rem] border border-slate-200/60 bg-slate-50/80 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.22)] sm:rounded-[2rem] sm:p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-xl bg-slate-100 p-2 text-slate-500">
                  <Clock size={18} />
                </div>
              </div>
              <p className="mb-1 text-base font-black text-slate-900 sm:text-lg">
                {user.autoReadmeEnabled ? "Real-time" : "Paused"}
              </p>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                Sync Status
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-[1.5rem] border border-sky-100 bg-sky-50/80 p-4 shadow-[0_16px_40px_-28px_rgba(14,165,233,0.2)] sm:rounded-[2rem] sm:p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-xl bg-white/80 p-2 text-sky-700">
                  <Github size={18} />
                </div>
                <span className="h-2 w-2 rounded-full bg-sky-500" />
              </div>
              <p className="mb-1 text-xl font-black text-sky-700 sm:text-2xl">
                {privateReposCount}
              </p>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                Private Repos
              </p>
            </motion.div>
          </div>

          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.3)] backdrop-blur-sm sm:rounded-[2rem] sm:p-6"
            >
              <div className="mb-5 flex items-center gap-2">
                <div className="h-1 w-6 rounded-full bg-blue-600" />
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                  Integrations
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-slate-900 p-2 text-white">
                      <Github size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        GitHub
                      </p>
                      <p className="truncate text-[11px] text-slate-400">
                        OAuth Connected
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                    <Check size={12} />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                      Active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                    <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                      Username
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-900">
                      @{user.githubUsername}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                    <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                      Auto README
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {user.autoReadmeEnabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/90 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.3)] backdrop-blur-sm sm:rounded-[2rem]"
          >
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex w-full items-center justify-between p-5 transition-all hover:bg-slate-50 sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2 text-slate-500">
                  <Settings size={18} />
                </div>
                <div className="text-left">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Settings
                  </p>
                  <span className="text-sm font-semibold text-slate-700">
                    Account Settings
                  </span>
                </div>
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
                  <div className="border-t border-slate-100 px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
                    <div className="rounded-[1.5rem] border border-rose-100 bg-rose-50/60 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle
                          size={18}
                          className="mt-0.5 shrink-0 text-rose-500"
                        />
                        <div className="flex-1">
                          <h5 className="mb-1 text-sm font-black uppercase tracking-tight text-rose-900">
                            Danger Zone
                          </h5>
                          <p className="mb-3 text-xs text-rose-700/80">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <button
                            onClick={() => setShowDeleteModal(true)}
                            className="text-xs font-semibold text-rose-700 underline underline-offset-2 transition-colors hover:text-rose-800"
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

        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText("");
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_-36px_rgba(15,23,42,0.55)] sm:p-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-black uppercase tracking-tight text-slate-900">
                    Delete Account
                  </h3>
                  <p className="text-sm text-slate-500">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-left font-mono text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Type <span className="text-rose-600">delete</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type 'delete' here"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-500"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText("");
                    }}
                    className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={
                      deleteConfirmText.toLowerCase() !== "delete" || isDeleting
                    }
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all ${
                      deleteConfirmText.toLowerCase() === "delete" && !isDeleting
                        ? "bg-rose-600 text-white hover:bg-rose-700"
                        : "cursor-not-allowed bg-rose-200 text-rose-400"
                    }`}
                  >
                    {isDeleting ? (
                      <>
                        <svg
                          className="h-5 w-5 animate-spin text-white"
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
    </>
  );
};

export default Profile;
