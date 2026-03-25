import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  GitBranch,
  RefreshCw,
  Loader2,
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
        color: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-100",
        glow: "shadow-[0_0_12px_-2px_rgba(29,78,216,0.16)]",
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
        color: "text-sky-700",
        bg: "bg-sky-50",
        border: "border-sky-100",
        glow: "shadow-[0_0_12px_-2px_rgba(14,165,233,0.2)]",
        icon: <Loader2 size={14} className="animate-spin" />,
      },
    };

    const s = config[status] || config.ongoing;

    return (
      <div
        className={`flex items-center justify-center gap-2 w-[130px] py-1.5 rounded-full border transition-all ${s.bg} ${s.border} ${s.color} ${s.glow}`}
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
      <div className="min-h-screen bg-linear-to-b from-white via-slate-50/70 to-white text-slate-900 font-sans selection:bg-sky-100">
        <AuthNavigation />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-24 left-[-7rem] h-72 w-72 rounded-full bg-blue-100/55 blur-3xl" />
          <div className="absolute top-72 right-[-8rem] h-96 w-96 rounded-full bg-sky-100/45 blur-3xl" />
        </div>

        <div className="relative pt-32 pb-20 px-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-8 bg-blue-600 rounded-full" />
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  Activity System
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-[1000] uppercase text-slate-900 tracking-tighter">
                Event Logs
              </h1>
              <p className="mt-3 max-w-2xl text-slate-500 font-medium tracking-tight">
                Track every automated documentation run with the same clean system language as the landing experience.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white/80 backdrop-blur-sm p-2 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
              <button
                onClick={() => fetchLogs(true)}
                className="flex items-center gap-2.5 bg-[#1d4ed8] px-6 py-3 rounded-[1.1rem] text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-[#1e40af] transition-all active:scale-95"
              >
                <RefreshCw
                  size={16}
                  strokeWidth={2.5}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh Feed
              </button>
            </div>
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
                color: "text-blue-700",
                bg: "bg-blue-50/80",
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
                color: "text-sky-700",
                bg: "bg-sky-50/80",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`border border-slate-200/60 p-5 rounded-[2rem] shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)] ${stat.bg}`}
              >
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-1">
                  {stat.label}
                </p>
                <p className={`text-2xl font-black ${stat.color}`}>
                  {stat.val}
                </p>
              </div>
            ))}
          </div>

          {/* Glass Log Container */}
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 backdrop-blur-xl shadow-[0_20px_50px_-32px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-3 border-b border-dashed border-slate-200 px-6 py-4 bg-linear-to-r from-blue-50/70 via-white to-transparent">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                <History size={18} />
              </div>
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                  Live Timeline
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  Recent automation activity across your repositories
                </p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {loading && logs.length === 0 ? (
                <div className="py-24 flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-blue-500" size={40} />
                  <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                    Loading Logs
                  </p>
                </div>
              ) : error ? (
                <div className="px-6 py-16 text-center">
                  <XCircle size={42} className="mx-auto mb-4 text-rose-500" />
                  <h3 className="mb-2 text-lg font-black uppercase tracking-tight text-slate-900">
                    Failed to load logs
                  </h3>
                  <p className="mb-6 text-sm text-slate-500">{error}</p>
                  <button
                    onClick={() => fetchLogs(true)}
                    className="rounded-full bg-[#1d4ed8] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#1e40af]"
                  >
                    Retry
                  </button>
                </div>
              ) : logs.length === 0 ? (
                <div className="px-6 py-20 text-center">
                  <History size={46} className="mx-auto mb-4 text-blue-300" />
                  <h3 className="mb-2 text-lg font-black uppercase tracking-tight text-slate-900">
                    No activity yet
                  </h3>
                  <p className="text-sm text-slate-500">
                    Once README jobs start running, this feed will show the latest activity here.
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
        className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 transition-colors ${commitUrl ? "cursor-pointer hover:bg-blue-50/40" : ""}`}
        onClick={() => commitUrl && window.open(commitUrl, "_blank")}
      >
        <div className="flex items-start gap-5">
          <div
            className={`mt-1 p-3 rounded-2xl border transition-all ${
              log.status === "failed"
                ? "bg-rose-50 border-rose-100 text-rose-500"
                : "bg-blue-50 border-blue-100 text-blue-600 group-hover:bg-white"
            }`}
          >
            <GitBranch size={20} />
          </div>

          <div className="min-w-0">
            <h3 className="text-[15px] font-black text-slate-800 tracking-tight mb-1 uppercase">
              {log.action.replace(/_/g, " ")}
            </h3>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-slate-400 tracking-tight">
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
