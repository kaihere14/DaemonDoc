import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Github,
  Mail,
  MapPin,
  Link as LinkIcon,
  Settings,
  Zap,
  ShieldCheck,
  Code2,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import AuthNavigation from "../components/AuthNavigation";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [repos, setRepos] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch repository stats
  useEffect(() => {
    const fetchRepos = async () => {
      if (user) {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await fetch(
            `${BACKEND_URL}/api/github/getGithubRepos`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setRepos(data.reposData || []);
          }
        } catch (error) {
          console.error("Error fetching repos:", error);
        } finally {
          setStatsLoading(false);
        }
      }
    };

    fetchRepos();
  }, [user]);

  //Delete handle function
  const HandleDelete = async () => {
    if(deleteConfirmText.toLowerCase()!="delete")return;
    setIsDeleting(true);
    try {
      await axios.delete(`${BACKEND_URL}/auth/delete`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
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

  // Show loading state while checking authentication
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-50">
      <AuthNavigation />
      <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        {/* SECTION 1: HERO HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[32px] p-8 mb-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* High-Resolution Avatar */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#2da44e] to-[#0969da] rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <img
                src={user.avatarUrl}
                alt={user.githubUsername}
                className="relative w-32 h-32 rounded-full border-4 border-white shadow-sm object-cover"
              />
            </div>

            {/* Identity Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-[900] tracking-tighter text-slate-900">
                  {user.name || user.githubUsername}
                </h1>
              </div>
              <p className="text-lg font-medium text-slate-500 mb-6">
                @{user.githubUsername}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500 font-medium">
                <a
                  href={`https://github.com/${user.githubUsername}`}
                  target="_blank"
                  className="flex items-center gap-1.5 text-[#0969da] hover:underline"
                >
                  <Github size={16} /> github.com/{user.githubUsername}
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SECTION 2: GRID CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats Section */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Repos */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-2 w-fit rounded-xl bg-slate-50 text-slate-400 mb-4 border border-slate-100">
                <Github size={18} />
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none mb-1">
                {statsLoading ? "..." : repos.length}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Total Repositories
              </p>
            </motion.div>

            {/* Active Repos */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-emerald-200 p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-2 w-fit rounded-xl bg-emerald-50 text-emerald-500 mb-4 border border-emerald-100">
                <Zap size={18} />
              </div>
              <p className="text-2xl font-black text-emerald-700 leading-none mb-1">
                {statsLoading ? "..." : repos.filter((r) => r.activated).length}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                Active AI Updates
              </p>
            </motion.div>

            {/* Auto-README Status (full width) */}
            <div className="sm:col-span-2 bg-white border border-slate-200 p-8 rounded-[24px] flex items-center justify-between overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  DaemonDoc Orchestration
                </h3>
                <p className="text-sm text-slate-500 font-medium max-w-sm">
                  Your AI engine is currently{" "}
                  {user.autoReadmeEnabled
                    ? "automatically updating"
                    : "paused for"}{" "}
                  your README files.
                </p>
              </div>
              <div
                className={`p-4 rounded-full ${
                  user.autoReadmeEnabled
                    ? "bg-emerald-50 text-emerald-500"
                    : "bg-slate-50 text-slate-300"
                }`}
              >
                <Zap
                  size={32}
                  className={user.autoReadmeEnabled ? "animate-pulse" : ""}
                  fill="currentColor"
                />
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-16 -translate-y-16" />
            </div>
          </div>

          {/* SIDEBAR: INTEGRATIONS */}
          <div className="bg-white border border-slate-200 p-8 rounded-[32px] shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
              Integrations
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Github size={18} />
                  <span className="text-xs font-bold">GitHub Linked</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700 transition-all duration-200 font-bold cursor-pointer text-white px-4 py-2 rounded-[32px]"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Delete Account
              </h3>
              <p className="text-slate-500 text-sm">
                This action cannot be undone. All your data will be permanently
                deleted.
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
    </div>
  );
};

export default Profile;
