import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  GitBranch,
  RefreshCw,
  Loader2,
  ChevronRight,
  History,
} from "lucide-react";
import AuthNavigation from "../components/AuthNavigation";
import SEO from "../components/SEO";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { api, ENDPOINTS } from "../lib/api";

const Logs = () => {
  useRequireAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { data } = await api.get(ENDPOINTS.FETCH_LOGS);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const config = {
      success: {
        label: "Success",
        color: "text-emerald-600",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        glow: "shadow-[0_0_12px_-2px_rgba(16,185,129,0.3)]",
        icon: <CheckCircle2 size={14} />,
      },
      failed: {
        label: "Failed",
        color: "text-rose-600",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        glow: "shadow-[0_0_12px_-2px_rgba(244,63,94,0.3)]",
        icon: <XCircle size={14} />,
      },
      ongoing: {
        label: "In progress",
        color: "text-sky-600",
        bg: "bg-sky-500/10",
        border: "border-sky-500/20",
        glow: "shadow-[0_0_12px_-2px_rgba(14,165,233,0.3)]",
        icon: <Loader2 size={14} className="animate-spin" />,
      },
    };

    const s = config[status] || config.ongoing;

    return (
      <div
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all ${s.bg} ${s.border} ${s.color} ${s.glow}`}
      >
        {s.icon}
        <span className="text-[11px] font-bold tracking-wider uppercase">
          {s.label}
        </span>
      </div>
    );
  };

  return (
    <>
      <SEO title="Activity Logs - DaemonDoc" />
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-sky-100">
        <AuthNavigation />

        <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-6 bg-slate-900 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Activity System
                </span>
              </div>
              <h1 className="text-4xl font-[900] text-slate-900 tracking-tighter">
                Event Logs
              </h1>
            </div>

            <button
              onClick={() => fetchLogs(true)}
              className="flex items-center gap-2.5 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <RefreshCw
                size={16}
                strokeWidth={2.5}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh Feed
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              {
                label: "Total",
                val: logs.length,
                color: "text-slate-900",
                bg: "bg-white",
              },
              {
                label: "Success",
                val: logs.filter((l) => l.status === "success").length,
                color: "text-emerald-600",
                bg: "bg-emerald-50/50",
              },
              {
                label: "Failed",
                val: logs.filter((l) => l.status === "failed").length,
                color: "text-rose-600",
                bg: "bg-rose-50/50",
              },
              {
                label: "Active",
                val: logs.filter((l) => l.status === "ongoing").length,
                color: "text-sky-600",
                bg: "bg-sky-50/50",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`border border-slate-200/60 p-5 rounded-3xl shadow-sm ${stat.bg}`}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  {stat.label}
                </p>
                <p className={`text-2xl font-black ${stat.color}`}>
                  {stat.val}
                </p>
              </div>
            ))}
          </div>

          {/* Glass Log Container */}
          <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="divide-y divide-slate-100">
              {loading && logs.length === 0 ? (
                <div className="py-24 flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-slate-300" size={40} />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Loading Logs
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {logs.map((log, index) => (
                    <LogItem
                      key={log._id}
                      log={log}
                      index={index}
                      StatusBadge={StatusBadge}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const LogItem = ({ log, index, StatusBadge }) => {
  const commitUrl =
    log.commitId && log.repoOwner
      ? `https://github.com/${log.repoOwner}/${log.repoName}/commit/${log.commitId}`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="group"
    >
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 transition-colors ${commitUrl ? "cursor-pointer hover:bg-slate-50/80" : ""}`}
        onClick={() => commitUrl && window.open(commitUrl, "_blank")}
      >
        <div className="flex items-start gap-5">
          <div
            className={`mt-1 p-3 rounded-2xl border transition-all ${
              log.status === "failed"
                ? "bg-rose-50 border-rose-100 text-rose-500"
                : "bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-white"
            }`}
          >
            <GitBranch size={20} />
          </div>

          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-slate-800 tracking-tight mb-1">
              {log.action.replace(/_/g, " ")}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 tracking-tight">
                {log.repoOwner
                  ? `${log.repoOwner}/${log.repoName}`
                  : log.repoName}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">
                {formatTimestamp(log.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-center">
          <StatusBadge status={log.status} />
          {commitUrl && (
            <ChevronRight
              size={18}
              className="text-slate-300 group-hover:text-slate-600 transition-all group-hover:translate-x-1"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMins = Math.floor((now - date) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default Logs;
