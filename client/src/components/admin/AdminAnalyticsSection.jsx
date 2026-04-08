import React from "react";
import {
  BarChart3,
  AlertCircle,
  RefreshCw,
  Loader2,
  Activity,
  CheckCircle2,
  XCircle,
  SkipForward,
} from "lucide-react";
import { motion } from "framer-motion";
import CountUpNumber from "./CountUpNumber";
import { fadeUpVariant, formatAnalyticsTimestamp } from "./adminUtils";

const STATUS_CONFIG = {
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
  skipped: {
    label: "Skipped",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-100",
    glow: "shadow-[0_0_12px_-2px_rgba(217,119,6,0.18)]",
    icon: <SkipForward size={14} />,
  },
};

const AdminAnalyticsSection = ({
  analyticsOverview,
  analyticsBreakdown,
  analyticsActivity,
  analyticsTopRepos,
  analyticsStats,
  isAnalyticsLoading,
  analyticsError,
  recentLogsData,
  isAnalyticsRefreshing,
  onRefresh,
  shouldReduceMotion,
}) => {
  const safeStats = Array.isArray(analyticsStats) ? analyticsStats : [];
  const safeActivity = Array.isArray(analyticsActivity)
    ? analyticsActivity
    : [];
  const safeTopRepos = Array.isArray(analyticsTopRepos)
    ? analyticsTopRepos
    : [];
  const recentLogs = Array.isArray(recentLogsData) ? recentLogsData : [];

  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
            Section 01
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
            Analytics
          </h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase transition-all hover:border-blue-200 hover:text-blue-600"
        >
          <RefreshCw
            size={14}
            className={isAnalyticsRefreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.32)] sm:p-8"
      >
        <div className="mb-8 flex flex-col gap-5 border-b border-dashed border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600 sm:h-16 sm:w-16">
              <BarChart3 size={32} strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-mono text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
                System Analytics
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900 uppercase">
                Platform Health
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                Live operational insight across repository automation, run
                reliability, and current activity trends.
              </p>
            </div>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-[10px] font-black tracking-[0.22em] text-slate-500 uppercase">
            Latest Activity
            <span className="text-slate-700">
              {formatAnalyticsTimestamp(analyticsOverview?.latestActivityAt)}
            </span>
          </div>
        </div>

        {isAnalyticsLoading ? (
          <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
            <Loader2 size={28} className="animate-spin text-blue-600" />
            <div>
              <p className="font-mono text-[10px] font-black tracking-[0.24em] text-slate-400 uppercase">
                Loading Analytics
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Aggregating repository activity and admin metrics.
              </p>
            </div>
          </div>
        ) : analyticsError ? (
          <div className="flex min-h-[320px] flex-1 flex-col justify-between rounded-[1.5rem] border border-rose-100 bg-rose-50/60 p-5">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-rose-500">
                <AlertCircle size={22} />
              </div>
              <p className="font-mono text-[10px] font-black tracking-[0.24em] text-rose-500 uppercase">
                Analytics Error
              </p>
              <p className="mt-3 text-sm leading-relaxed text-rose-700">
                {analyticsError}
              </p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold tracking-[0.2em] text-white uppercase transition-all hover:bg-rose-700"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: shouldReduceMotion ? 0 : 0.04,
                },
              },
            }}
            className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]"
          >
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {safeStats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={fadeUpVariant}
                    className="rounded-[1.35rem] border border-slate-200 bg-linear-to-b from-white to-slate-50/70 p-4"
                  >
                    <p className="font-mono text-[10px] font-black tracking-[0.24em] text-slate-400 uppercase">
                      {stat.label}
                    </p>
                    <p className={`mt-2 text-2xl font-black ${stat.tone}`}>
                      <CountUpNumber value={stat.value} suffix={stat.suffix} />
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                variants={fadeUpVariant}
                className="rounded-[1.5rem] border border-slate-200 bg-linear-to-r from-blue-50/80 via-white to-white p-4 sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : {
                            boxShadow: [
                              "0 8px 20px -12px rgba(59,130,246,0.20)",
                              "0 10px 24px -12px rgba(59,130,246,0.28)",
                              "0 8px 20px -12px rgba(59,130,246,0.20)",
                            ],
                          }
                    }
                    transition={
                      shouldReduceMotion
                        ? undefined
                        : {
                            repeat: Infinity,
                            duration: 4.2,
                            ease: "easeInOut",
                          }
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200"
                  >
                    <Activity size={18} />
                  </motion.div>
                  <div>
                    <p className="font-mono text-[10px] font-black tracking-[0.24em] text-slate-400 uppercase">
                      Live Pulse
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      <CountUpNumber
                        value={analyticsOverview?.logsInLast24Hours || 0}
                      />{" "}
                      events in the last 24h
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    {
                      label: "Success",
                      value: analyticsBreakdown?.success || 0,
                      className: "bg-blue-50 text-blue-700",
                    },
                    {
                      label: "Failed",
                      value: analyticsBreakdown?.failed || 0,
                      className: "bg-rose-50 text-rose-600",
                    },
                    {
                      label: "Skipped",
                      value: analyticsBreakdown?.skipped || 0,
                      className: "bg-amber-50 text-amber-700",
                    },
                    {
                      label: "Live",
                      value: analyticsOverview?.liveJobs || 0,
                      className: "bg-sky-50 text-sky-700",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: shouldReduceMotion ? 0 : 0.12 + index * 0.04,
                        duration: shouldReduceMotion ? 0 : 0.24,
                      }}
                      className={`rounded-2xl px-3 py-3 ${item.className}`}
                    >
                      <p className="font-mono text-[10px] font-black tracking-[0.2em] uppercase opacity-70">
                        {item.label}
                      </p>
                      <p className="mt-1 text-lg font-black">
                        <CountUpNumber value={item.value} />
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                variants={fadeUpVariant}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] font-black tracking-[0.24em] text-slate-400 uppercase">
                      Weekly Activity
                    </p>
                    <p className="text-sm font-semibold text-slate-600">
                      Total log volume over the last 7 days
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                    7 days
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {safeActivity.map((day, index) => {
                    const height = Math.max(day.total * 16, 14);
                    return (
                      <motion.div
                        key={day.date}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: shouldReduceMotion ? 0 : 0.04 + index * 0.03,
                          duration: shouldReduceMotion ? 0 : 0.24,
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="flex h-28 w-full items-end rounded-2xl bg-slate-50 px-2 py-2">
                          <motion.div
                            className="w-full rounded-xl bg-linear-to-t from-blue-600 to-sky-400"
                            initial={{ height: "0%" }}
                            animate={{
                              height: `${Math.min(height, 100)}%`,
                            }}
                            transition={{
                              delay: shouldReduceMotion
                                ? 0
                                : 0.08 + index * 0.04,
                              duration: shouldReduceMotion ? 0 : 0.4,
                              ease: [0.2, 0.8, 0.2, 1],
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-black text-slate-700 uppercase">
                            <CountUpNumber value={day.total} duration={800} />
                          </p>
                          <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                            {day.label}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                variants={fadeUpVariant}
                className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-5 sm:p-6"
              >
                <div className="flex flex-col gap-2">
                  <p className="font-mono text-[10px] font-black tracking-[0.24em] text-slate-400 uppercase">
                    Recent Repository Activity
                  </p>
                  <p className="text-sm font-semibold text-slate-600">
                    {recentLogs.length} recent log entries
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.24 }}
                  className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3"
                >
                  {recentLogs.length === 0 ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                      <AlertCircle size={18} />
                      No recent activity has been recorded.
                    </div>
                  ) : (
                    recentLogs.map((log, index) =>
                      (() => {
                        const statusCfg =
                          STATUS_CONFIG[log.status] || STATUS_CONFIG.ongoing;

                        return (
                          <div
                            key={`${log._id || log.timestamp || log.repoName || "log"}-${index}`}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
                          >
                            <div className="flex flex-col">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {log.repoName || "Unknown repository"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {log.repoOwner ? `by ${log.repoOwner}` : ""}
                              </p>
                              <p className="text-xs text-neutral-400">
                                {formatAnalyticsTimestamp(
                                  log.updatedAt || log.timestamp,
                                )}
                              </p>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold uppercase drop-shadow-2xl text-shadow-2xs ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color} ${statusCfg.glow}`}
                              >
                                {statusCfg.icon}
                                {statusCfg.label}
                              </span>
                            </div>
                          </div>
                        );
                      })(),
                    )
                  )}
                </motion.div>
              </motion.div>
            </div>

            <div className="space-y-5">
              <motion.div
                variants={fadeUpVariant}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5"
              >
                <div className="mb-4">
                  <p className="font-mono text-[10px] font-black tracking-[0.24em] text-slate-400 uppercase">
                    Top Repositories
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    Most active repos by automation events
                  </p>
                </div>

                <div className="space-y-3">
                  {safeTopRepos.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                      No repository activity has been recorded yet.
                    </div>
                  ) : (
                    safeTopRepos.map((repo, index) => (
                      <motion.div
                        key={`${repo.repoOwner}-${repo.repoName}`}
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: shouldReduceMotion ? 0 : 0.08 + index * 0.04,
                          duration: shouldReduceMotion ? 0 : 0.22,
                        }}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black tracking-tight text-slate-900 uppercase">
                            {repo.repoName}
                          </p>
                          <p className="truncate font-mono text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                            {repo.repoOwner || "unknown owner"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-blue-700">
                            <CountUpNumber value={repo.count} duration={850} />
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatAnalyticsTimestamp(repo.lastEventAt)}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>

              <motion.div
                variants={fadeUpVariant}
                className="rounded-[1.5rem] border border-slate-200 bg-linear-to-b from-slate-50 to-white p-4 sm:p-5"
              >
                <p className="font-mono text-[10px] font-black tracking-[0.24em] text-slate-400 uppercase">
                  Reliability Notes
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      label: "Current queue",
                      value: `${analyticsOverview?.liveJobs || 0} live jobs`,
                    },
                    {
                      label: "Run health",
                      value: `${analyticsOverview?.successRate || 0}% success rate`,
                    },
                    {
                      label: "Recent pace",
                      value: `${analyticsOverview?.logsInLast24Hours || 0} events in 24h`,
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: shouldReduceMotion ? 0 : 0.08 + index * 0.04,
                        duration: shouldReduceMotion ? 0 : 0.22,
                      }}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <p className="font-mono text-[10px] font-black tracking-[0.18em] text-slate-400 uppercase">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {item.value}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default AdminAnalyticsSection;
