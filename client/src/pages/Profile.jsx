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
import AuthNavigation from "../components/AuthNavigation";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [repos, setRepos] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>
      </div>
    </div>
  );
};

export default Profile;
