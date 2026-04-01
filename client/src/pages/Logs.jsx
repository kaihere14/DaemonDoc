import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  GitBranch,
  RefreshCw,
  Loader2,
  History,
  SkipForward,
} from "lucide-react";
import AuthNavigation from "../components/AuthNavigation";
import SEO from "../components/SEO";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { api, ENDPOINTS } from "../lib/api";

const STATUS_CONFIG = {
  success: {
    label: "Success",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-100",
    glow: "shadow-[0_0_12px_-2px_rgba(29,78,216,0.16)]",
    icon: <CheckCircle2 size={14} />,
    panelTone: "bg-blue-50 border-blue-100 text-blue-600 group-hover:bg-white",
  },
  failed: {
    label: "Failed",
    color: "text-rose-600",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    glow: "shadow-[0_0_12px_-2px_rgba(244,63,94,0.3)]",
    icon: <XCircle size={14} />,
    panelTone: "bg-rose-50 border-rose-100 text-rose-500",
  },
  ongoing: {
    label: "In progress",
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-100",
    glow: "shadow-[0_0_12px_-2px_rgba(14,165,233,0.2)]",
    icon: <Loader2 size={14} className="animate-spin" />,
    panelTone: "bg-sky-50 border-sky-100 text-sky-600 group-hover:bg-white",
  },
  skipped: {
    label: "Skipped",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-100",
    glow: "shadow-[0_0_12px_-2px_rgba(217,119,6,0.18)]",
    icon: <SkipForward size={14} />,
    panelTone:
      "bg-amber-50 border-amber-100 text-amber-600 group-hover:bg-white",
  },
};

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
    const s = STATUS_CONFIG[status] || STATUS_CONFIG.ongoing;

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

        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-32">
          {/* Header */}
          <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-center md:justify-between md:gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-8 bg-blue-600 rounded-full" />
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  Activity System
                </span>
              </div>
              <h1 className="text-3xl font-[1000] uppercase tracking-tighter text-slate-900 sm:text-5xl">
                Event Logs
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium tracking-tight text-slate-500 sm:text-base">
                Track every automated documentation run with the same clean system language as the landing experience.
              </p>
            </div>

            <div className="w-full rounded-[1.5rem] border border-slate-200 bg-white/80 p-2 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:w-auto sm:rounded-[1.75rem]">
              <button
                onClick={() => fetchLogs(true)}
                className="flex w-full items-center justify-center gap-2.5 rounded-[1rem] bg-[#1d4ed8] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1e40af] active:scale-95 sm:w-auto sm:rounded-[1.1rem] sm:px-6"
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
          <div className="mb-8 grid grid-cols-2 gap-3 sm:mb-10 sm:gap-4 md:grid-cols-5">
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
                label: "Skipped",
                val: logs.filter((l) => l.status === "skipped").length,
                color: "text-amber-700",
                bg: "bg-amber-50/70",
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
                className={`rounded-[1.5rem] border border-slate-200/60 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)] sm:rounded-[2rem] sm:p-5 ${stat.bg}`}
              >
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-1">
                  {stat.label}
                </p>
                <p className={`text-xl font-black sm:text-2xl ${stat.color}`}>
                  {stat.val}
                </p>
              </div>
            ))}
          </div>

          {/* Glass Log Container */}
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/85 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:rounded-[2rem]">
            <div className="flex items-start gap-3 border-b border-dashed border-slate-200 bg-linear-to-r from-blue-50/70 via-white to-transparent px-4 py-4 sm:items-center sm:px-6">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 sm:size-10">
                <History size={18} />
              </div>
              <div className="min-w-0">
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
                <div className="px-4 py-14 text-center sm:px-6 sm:py-16">
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
                <div className="px-4 py-16 text-center sm:px-6 sm:py-20">
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
  const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG.ongoing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="group"
    >
      <div
        className={`flex flex-col justify-between gap-4 p-4 transition-colors sm:flex-row sm:items-center sm:p-6 ${commitUrl ? "cursor-pointer hover:bg-blue-50/40" : ""}`}
        onClick={() => commitUrl && window.open(commitUrl, "_blank")}
      >
        <div className="flex min-w-0 items-start gap-3 sm:gap-5">
          <div
            className={`mt-1 rounded-2xl border p-2.5 transition-all sm:p-3 ${statusConfig.panelTone}`}
          >
            <GitBranch size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="mb-1 text-[14px] font-black uppercase tracking-tight text-slate-800 sm:text-[15px]">
              {log.action.replace(/_/g, " ")}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-3">
              <span className="truncate font-mono text-xs font-bold tracking-tight text-slate-400">
                {log.repoOwner
                  ? `${log.repoOwner}/${log.repoName}`
                  : log.repoName}
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-200 sm:block" />
              <span className="text-xs font-medium text-slate-400">
                {formatTimestamp(log.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-center">
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
