/* eslint-disable react/prop-types */
import React from "react";
import {
  CreditCard,
  Loader2,
  RefreshCw,
  AlertCircle,
  ReceiptText,
  TrendingUp,
  BadgeIndianRupee,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { api, ENDPOINTS } from "../../lib/api";
import CountUpNumber from "./CountUpNumber";
import { fadeUpVariant, formatAnalyticsTimestamp } from "./adminUtils";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format((amount || 0) / 100);

const toneByStatus = {
  success: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
  },
  failed: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-100",
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
  },
};

const ChartCard = ({
  title,
  subtitle,
  icon,
  data,
  dataKey,
  valueFormatter,
  fillClass,
  shouldReduceMotion,
}) => {
  const maxValue = Math.max(...data.map((item) => item[dataKey] || 0), 1);

  return (
    <motion.div
      variants={fadeUpVariant}
      className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
            {title}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            {subtitle}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
          {icon}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:grid-cols-14">
        {data.map((day, index) => {
          const value = day[dataKey] || 0;
          const height = Math.max((value / maxValue) * 100, value > 0 ? 12 : 4);

          return (
            <div key={`${dataKey}-${day.date}`} className="flex flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end rounded-2xl bg-slate-50 px-1.5 py-2">
                <motion.div
                  className={`w-full rounded-xl ${fillClass}`}
                  initial={{ height: shouldReduceMotion ? `${height}%` : "0%" }}
                  animate={{ height: `${height}%` }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.42,
                    delay: shouldReduceMotion ? 0 : 0.04 + index * 0.02,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                  title={`${day.shortDate}: ${valueFormatter(value)}`}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-slate-800">
                  {valueFormatter(value)}
                </p>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {day.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

const AdminPaymentsSection = ({
  sectionNumber = "02",
  shouldReduceMotion,
}) => {
  const [analytics, setAnalytics] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState("");

  const fetchPaymentAnalytics = React.useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const { data } = await api.get(ENDPOINTS.ADMIN_PAYMENT_ANALYTICS);
      setAnalytics(data);
      setError("");
    } catch (fetchError) {
      console.error("Error loading payment analytics:", fetchError);
      setError(
        fetchError.response?.data?.message ||
          "Failed to load payment analytics",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPaymentAnalytics();
  }, [fetchPaymentAnalytics]);

  const overview = analytics?.overview || {};
  const activity = Array.isArray(analytics?.activity) ? analytics.activity : [];
  const recentLogs = Array.isArray(analytics?.recentLogs)
    ? analytics.recentLogs
    : [];

  const cards = [
    {
      label: "Paid Users",
      value: overview.paidUsers || 0,
      tone: "text-slate-900",
      icon: <Users size={18} />,
      prefix: "",
      isCurrency: false,
    },
    {
      label: "Revenue",
      value: overview.totalRevenue || 0,
      tone: "text-blue-700",
      icon: <BadgeIndianRupee size={18} />,
      prefix: "₹",
      isCurrency: true,
    },
    {
      label: "MRR",
      value: overview.mrr || 0,
      tone: "text-sky-700",
      icon: <TrendingUp size={18} />,
      prefix: "₹",
      isCurrency: true,
    },
    {
      label: "ARR",
      value: overview.arr || 0,
      tone: "text-emerald-700",
      icon: <CreditCard size={18} />,
      prefix: "₹",
      isCurrency: true,
    },
  ];

  return (
    <section className="mt-16">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
            Section {sectionNumber}
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-900 sm:text-3xl">
            Paid Users
          </h2>
        </div>
        <button
          type="button"
          onClick={() => fetchPaymentAnalytics(true)}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 transition-all hover:border-blue-200 hover:text-blue-600"
        >
          <RefreshCw
            size={14}
            className={isRefreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08 }}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.32)] sm:p-8"
      >
        <div className="mb-8 flex flex-col gap-5 border-b border-dashed border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 sm:h-16 sm:w-16">
              <CreditCard size={30} strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                Revenue Surface
              </p>
              <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-900">
                Cashflow + Buyer Trendline
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                Track paid user count, incoming revenue, recurring run-rate,
                and the raw ledger that backs every payment event.
              </p>
            </div>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
            Latest Transfer
            <span className="text-slate-700">
              {formatAnalyticsTimestamp(overview.latestPaymentAt)}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
            <Loader2 size={28} className="animate-spin text-blue-600" />
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                Loading Revenue Analytics
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Pulling payment history and subscriber metrics.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[320px] flex-col justify-between rounded-[1.5rem] border border-rose-100 bg-rose-50/60 p-5">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-rose-500">
                <AlertCircle size={22} />
              </div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-rose-500">
                Payment Analytics Error
              </p>
              <p className="mt-3 text-sm leading-relaxed text-rose-700">
                {error}
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchPaymentAnalytics(true)}
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-rose-700"
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
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {cards.map((card) => (
                <motion.div
                  key={card.label}
                  variants={fadeUpVariant}
                  className="rounded-[1.35rem] border border-slate-200 bg-linear-to-b from-white to-slate-50/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      {card.label}
                    </p>
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      {card.icon}
                    </div>
                  </div>
                  <p className={`mt-3 text-2xl font-black ${card.tone}`}>
                    {card.isCurrency ? (
                      <>
                        {card.prefix}
                        <CountUpNumber value={Math.round(card.value / 100)} />
                      </>
                    ) : (
                      <CountUpNumber value={card.value} />
                    )}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={fadeUpVariant}
              className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-linear-to-r from-blue-50/80 via-white to-white p-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {[
                {
                  label: "Successful Payments",
                  value: overview.successfulPayments || 0,
                  tone: "text-blue-700",
                },
                {
                  label: "Failed Payments",
                  value: overview.failedPayments || 0,
                  tone: "text-rose-600",
                },
                {
                  label: "Monthly Buyers",
                  value: overview.monthlyPaidUsers || 0,
                  tone: "text-sky-700",
                },
                {
                  label: "Yearly Buyers",
                  value: overview.yearlyPaidUsers || 0,
                  tone: "text-emerald-700",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4"
                >
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {item.label}
                  </p>
                  <p className={`mt-2 text-xl font-black ${item.tone}`}>
                    <CountUpNumber value={item.value} />
                  </p>
                </div>
              ))}
            </motion.div>

            <div className="grid gap-5 xl:grid-cols-2">
              <ChartCard
                title="Daily Buyers"
                subtitle="Successful purchases across the last 14 days"
                icon={<Users size={18} />}
                data={activity}
                dataKey="purchases"
                valueFormatter={(value) => value}
                fillClass="bg-linear-to-t from-blue-600 to-sky-400"
                shouldReduceMotion={shouldReduceMotion}
              />
              <ChartCard
                title="Daily Revenue"
                subtitle="Captured money transferred each day"
                icon={<BadgeIndianRupee size={18} />}
                data={activity}
                dataKey="revenue"
                valueFormatter={(value) => `₹${Math.round((value || 0) / 100)}`}
                fillClass="bg-linear-to-t from-emerald-600 to-sky-400"
                shouldReduceMotion={shouldReduceMotion}
              />
            </div>

            <motion.div
              variants={fadeUpVariant}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    Payment Ledger
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    Most recent payment events stored in MongoDB
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                  <ReceiptText size={18} />
                </div>
              </div>

              {recentLogs.length === 0 ? (
                <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center text-sm text-slate-500">
                  No payment events yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <th className="pb-3 pr-4">User</th>
                        <th className="pb-3 pr-4">Type</th>
                        <th className="pb-3 pr-4">Amount</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4">When</th>
                        <th className="pb-3">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentLogs.map((log) => {
                        const tone = toneByStatus[log.status] || toneByStatus.pending;
                        const username =
                          log.user?.githubUsername || log.user?.email || "Unknown user";

                        return (
                          <tr key={log.id} className="align-top">
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-xs font-black uppercase text-slate-500">
                                  {log.user?.avatarUrl ? (
                                    <img
                                      src={log.user.avatarUrl}
                                      alt={username}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    username.slice(0, 2)
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-900">
                                    {username}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {log.user?.planInterval || "plan interval unknown"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">
                                {log.type.replaceAll("_", " ")}
                              </span>
                            </td>
                            <td className="py-4 pr-4 text-sm font-semibold text-slate-700">
                              {log.amount ? formatCurrency(log.amount) : "—"}
                            </td>
                            <td className="py-4 pr-4">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${tone.bg} ${tone.text} ${tone.border}`}
                              >
                                {log.status}
                              </span>
                            </td>
                            <td className="py-4 pr-4 text-sm text-slate-500">
                              {new Date(log.createdAt).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </td>
                            <td className="py-4 text-sm text-slate-500">
                              {log.note || "No note recorded"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default AdminPaymentsSection;
