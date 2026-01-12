import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  GitBranch,
  RefreshCw,
  Loader2,
} from "lucide-react";
import AuthNavigation from "../components/AuthNavigation";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Logs = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${BACKEND_URL}/api/github/fetchUserLogs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle2 size={20} className="text-emerald-500" />;
      case "failed":
        return <XCircle size={20} className="text-red-500" />;
      case "ongoing":
        return <Clock size={20} className="text-amber-500 animate-pulse" />;
      default:
        return <Activity size={20} className="text-slate-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-emerald-50 border-emerald-200";
      case "failed":
        return "bg-red-50 border-red-200";
      case "ongoing":
        return "bg-amber-50 border-amber-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      README_GENERATION_STARTED: "README Generation Started",
      README_GENERATION_SUCCESS: "README Generated Successfully",
      README_GENERATION_FAILED: "README Generation Failed",
      GITHUB_REPO_CONNECTED: "Repository Connected",
      GITHUB_AUTH_FAILED: "Authentication Failed",
      README_COMMIT_PUSHED: "README Committed to GitHub",
    };
    return labels[action] || action;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      success: "bg-emerald-100 text-emerald-700 border-emerald-300",
      failed: "bg-red-100 text-red-700 border-red-300",
      ongoing: "bg-amber-100 text-amber-700 border-amber-300",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          styles[status] || styles.ongoing
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <>
      <SEO
        title="Activity Logs - DaemonDoc | Track Your README Updates"
        description="View detailed activity logs of all README generation and repository updates."
        ogUrl="https://daemondoc.online/logs"
        canonical="https://daemondoc.online/logs"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white text-slate-900 font-sans selection:bg-indigo-100">
        <AuthNavigation />

        <div className="pt-24 pb-16 px-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 p-3 rounded-xl">
                    <Activity size={24} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900">
                      Activity Logs
                    </h1>
                    <p className="text-slate-600 mt-1">
                      Track all README generation and repository activities
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchLogs(true)}
                  disabled={refreshing}
                  className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Refresh
                </motion.button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-6 flex-wrap">
                <div className="bg-white border border-slate-200 rounded-xl px-6 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-slate-600" />
                    <span className="text-2xl font-bold text-slate-900">
                      {logs.length}
                    </span>
                    <span className="text-sm text-slate-500">
                      Total Activities
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-emerald-200 rounded-xl px-6 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span className="text-2xl font-bold text-emerald-700">
                      {logs.filter((l) => l.status === "success").length}
                    </span>
                    <span className="text-sm text-emerald-600">Successful</span>
                  </div>
                </div>
                <div className="bg-white border border-red-200 rounded-xl px-6 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <XCircle size={16} className="text-red-600" />
                    <span className="text-2xl font-bold text-red-700">
                      {logs.filter((l) => l.status === "failed").length}
                    </span>
                    <span className="text-sm text-red-600">Failed</span>
                  </div>
                </div>
                <div className="bg-white border border-amber-200 rounded-xl px-6 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-600" />
                    <span className="text-2xl font-bold text-amber-700">
                      {logs.filter((l) => l.status === "ongoing").length}
                    </span>
                    <span className="text-sm text-amber-600">In Progress</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Logs List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
            >
              {loading && logs.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={48} className="text-slate-400 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <XCircle size={48} className="text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Failed to load activity logs
                  </h3>
                  <p className="text-red-700 text-sm mb-4">{error}</p>
                  <button
                    onClick={fetchLogs}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all"
                  >
                    Try Again
                  </button>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-20 px-6">
                  <Activity size={48} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No activity logs yet
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Logs will appear when you activate repositories and generate
                    READMEs
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {refreshing && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                      <Loader2
                        size={32}
                        className="text-slate-600 animate-spin"
                      />
                    </div>
                  )}
                  <div className="divide-y divide-slate-200">
                    <AnimatePresence>
                      {logs.map((log, index) => {
                        // Build commit URL if commitId and repoOwner exist
                        const commitUrl =
                          log.commitId && log.repoOwner
                            ? `https://github.com/${log.repoOwner}/${log.repoName}/commit/${log.commitId}`
                            : null;

                        const LogCard = (
                          <motion.div
                            key={log._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.03 }}
                            className={`p-6 transition-all ${getStatusColor(
                              log.status
                            )} ${
                              commitUrl
                                ? "hover:bg-slate-100 cursor-pointer hover:shadow-md hover:scale-[1.01]"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1">
                                <div className="mt-1">
                                  {getStatusIcon(log.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-slate-900">
                                      {getActionLabel(log.action)}
                                    </h3>
                                    {getStatusBadge(log.status)}
                                    {commitUrl && (
                                      <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                                        View Commit →
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                                    <GitBranch size={14} />
                                    <span className="font-mono">
                                      {log.repoOwner
                                        ? `${log.repoOwner}/${log.repoName}`
                                        : log.repoName}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    {formatTimestamp(log.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );

                        return commitUrl ? (
                          <a
                            key={log._id}
                            href={commitUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            {LogCard}
                          </a>
                        ) : (
                          LogCard
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Logs;
