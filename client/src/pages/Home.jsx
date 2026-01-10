/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AuthNavigation from "../components/AuthNavigation";
import { useAuth } from "../context/AuthContext";
import RepoCard from "../components/RepoCard";
import { Loader2, Github, AlertCircle, RefreshCw } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Home = () => {
  const { user } = useAuth();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, active, inactive

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
        setRepos(data.reposData || []);
      } catch (error) {
        console.error("Error fetching repos:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredRepos = repos.filter((repo) => {
    if (filter === "active") return repo.activated;
    if (filter === "inactive") return !repo.activated;
    return true;
  });

  const activeCount = repos.filter((r) => r.activated).length;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-white text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden">
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
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                  Your Repositories
                </h1>
                <p className="text-slate-600">
                  Manage AI-powered README updates for your GitHub repositories
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

            {/* Stats Bar */}
            <div className="flex items-center gap-4 mt-6">
              <div className="bg-white border border-slate-200 rounded-xl px-6 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <Github size={20} className="text-slate-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{repos.length}</p>
                    <p className="text-xs text-slate-500">Total Repositories</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-emerald-200 rounded-xl px-6 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
                    <p className="text-xs text-emerald-600">Active AI Updates</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-6 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm"
          >
            {[
              { key: "all", label: "All Repositories" },
              { key: "active", label: "Active" },
              { key: "inactive", label: "Inactive" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === tab.key
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={48} className="text-slate-400 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Loading your repositories...</p>
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
          ) : filteredRepos.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredRepos.map((repo, index) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <RepoCard repo={repo} showToggle={true} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-xl p-12 text-center"
            >
              <Github size={64} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No repositories found
              </h3>
              <p className="text-slate-600">
                {filter === "active"
                  ? "You haven't activated any repositories yet. Toggle the switch on a repository to enable AI updates."
                  : filter === "inactive"
                  ? "All your repositories have AI updates enabled!"
                  : "Connect your GitHub account to see your repositories here."}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
