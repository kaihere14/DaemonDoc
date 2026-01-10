/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AuthNavigation from "../components/AuthNavigation";
import { useAuth } from "../context/AuthContext";
import RepoCard from "../components/RepoCard";
import { Loader2, Sparkles, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRepos();
  }, [user]);

  const fetchRepos = async () => {
    if (user) {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${BACKEND_URL}/api/github/getGithubRepos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch repositories");
        }
        
        const data = await response.json();
        const activeRepos = (data.reposData || []).filter(repo => repo.activated);
        setRepos(activeRepos);
      } catch (error) {
        console.error("Error fetching repos:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-slate-50 text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden">
      <AuthNavigation />
      
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Sparkles size={24} className="text-emerald-600" />
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900">
                    Active Repositories
                  </h1>
                </div>
                <p className="text-slate-600">
                  Repositories with AI-powered README updates enabled
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchRepos}
                disabled={loading}
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </motion.button>
            </div>

            {/* Info Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mt-6"
            >
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 p-2 rounded-lg shrink-0">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900 mb-1">
                    AI Updates Active
                  </h3>
                  <p className="text-sm text-emerald-700">
                    These repositories are being monitored for changes. When you push commits,
                    our AI will automatically analyze your code and update the README accordingly.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={48} className="text-emerald-400 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Loading active repositories...</p>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-8 text-center"
            >
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Failed to load repositories
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={fetchRepos}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all"
              >
                Try Again
              </button>
            </motion.div>
          ) : repos.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {repos.map((repo, index) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <RepoCard repo={repo} showToggle={false} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-xl p-12 text-center"
            >
              <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={40} className="text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                No Active Repositories Yet
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                You haven't enabled AI updates for any repositories. Head to your repositories
                page and toggle the switch to activate AI-powered README updates.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/home")}
                className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg mx-auto"
              >
                Go to Repositories
                <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
