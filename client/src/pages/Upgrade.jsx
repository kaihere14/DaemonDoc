import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Check,
  ArrowLeft,
  Loader2,
  Shield,
  Crown,
  Calendar,
  Receipt,
  ChevronRight,
  Infinity,
} from "lucide-react";
import { toast } from "sonner";
import AuthNavigation from "../components/AuthNavigation";
import SEO from "../components/SEO";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { useAuth } from "../context/AuthContext";
import { api, ENDPOINTS } from "../lib/api";

const formatPrice = (paise) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

const PRO_FEATURES = [
  { label: "Unlimited active repositories", free: "5 repos" },
  { label: "20 project reviews / month", free: "1 review" },
  { label: "10 competitor analyses / month", free: "1 analysis" },
  { label: "Priority AI generation queue", free: "Standard" },
  { label: "Email support", free: false },
];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Upgrade = () => {
  const navigate = useNavigate();
  const { user } = useRequireAuth();
  const { setUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState("pro_monthly");
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [availablePlans, setAvailablePlans] = useState([]);

  const isPro = user?.plan === "pro";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [myPlanRes, plansRes] = await Promise.all([
          api.get(ENDPOINTS.PAYMENT_MY_PLAN),
          api.get(ENDPOINTS.PAYMENT_PLANS),
        ]);
        setPlanData(myPlanRes.data);
        const paid = plansRes.data.plans.filter((p) => p.interval !== "free");
        setAvailablePlans(paid);
        if (paid.length > 0) setSelectedPlan(paid[0].planId);
      } catch {
        // non-critical
      } finally {
        setPlanLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        setLoading(false);
        return;
      }

      const { data } = await api.post(ENDPOINTS.PAYMENT_CREATE_ORDER, {
        planId: selectedPlan,
      });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "DaemonDoc",
        description: data.planLabel,
        order_id: data.orderId,
        prefill: {
          email: user.email || "",
          name: user.githubUsername || "",
        },
        theme: { color: "#1d4ed8" },
        handler: async (response) => {
          try {
            await api.post(ENDPOINTS.PAYMENT_VERIFY, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: selectedPlan,
            });
            setUser((prev) => ({ ...prev, plan: "pro" }));
            toast.success("Pro plan activated! Welcome aboard.");
            navigate("/home");
          } catch {
            toast.error(
              "Payment received but activation failed. Please contact support.",
            );
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatAmount = (paise, currency = "INR") => {
    if (!paise) return "—";
    const amount = paise / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <SEO
        title="Upgrade to Pro — DaemonDoc"
        description="Unlock unlimited repositories, more reviews and competitor analyses with DaemonDoc Pro."
        ogUrl="https://daemondoc.online/upgrade"
        canonical="https://daemondoc.online/upgrade"
      />
      <div className="min-h-screen bg-linear-to-b from-white via-slate-50/70 to-white text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden">
        <AuthNavigation />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-24 left-[-8rem] h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute top-52 right-[-6rem] h-80 w-80 rounded-full bg-sky-100/40 blur-3xl" />
        </div>

        <div className="relative px-4 pb-14 pt-22 sm:px-6 sm:pb-16 sm:pt-24">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-10"
            >
              <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft size={15} />
                Back
              </button>
              <div className="mb-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-1 w-8 rounded-full bg-blue-600" />
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                      {isPro ? "Subscription" : "Upgrade"}
                    </span>
                  </div>
                  <h1 className="mb-3 text-3xl font-black uppercase leading-none tracking-tighter text-slate-900 sm:text-5xl">
                    {isPro ? "Your Plan" : "Go Pro"}
                  </h1>
                  <p className="max-w-2xl text-sm font-medium tracking-tight text-slate-500 sm:text-base">
                    {isPro
                      ? "You're on the Pro plan. Here are your subscription details."
                      : "Unlock unlimited repositories and advanced features."}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ── PRO STATE ─────────────────────────────────────────────── */}
            {isPro ? (
              <div className="space-y-5">

                {/* Plan status card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-5 shadow-[0_20px_50px_-32px_rgba(29,78,216,0.25)] sm:rounded-[2rem] sm:p-8"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25">
                        <Crown size={24} />
                      </div>
                      <div>
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-blue-400">
                          Active Plan
                        </p>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                          Pro
                        </h2>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          <span className="text-xs font-semibold text-blue-700">Active</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 sm:text-right">
                      <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                        Access Until
                      </p>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <Calendar size={14} className="text-slate-400" />
                        <p className="text-sm font-semibold text-slate-700">
                          {planLoading ? (
                            <span className="inline-block h-4 w-28 animate-pulse rounded bg-slate-200" />
                          ) : (
                            formatDate(planData?.planExpiry)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Plan limits */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.3)] backdrop-blur-sm sm:rounded-[2rem] sm:p-6"
                >
                  <div className="mb-5 flex items-center gap-2">
                    <div className="h-1 w-6 rounded-full bg-blue-600" />
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Your Limits
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      {
                        label: "Active Repos",
                        unlimited: planData?.activeRepoLimit === null,
                        limit: planData?.activeRepoLimit,
                        used: null, // no monthly cap — just unlimited
                        resetAt: null,
                      },
                      {
                        label: "Reviews",
                        unlimited: false,
                        limit: planData?.usage?.reviews?.limit ?? planData?.reviewLimit ?? 20,
                        used: planData?.usage?.reviews?.used ?? 0,
                        resetAt: planData?.usage?.reviews?.resetAt,
                      },
                      {
                        label: "Competitor Analyses",
                        unlimited: false,
                        limit: planData?.usage?.competitor?.limit ?? planData?.competitorLimit ?? 10,
                        used: planData?.usage?.competitor?.used ?? 0,
                        resetAt: planData?.usage?.competitor?.resetAt,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4"
                      >
                        <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                          {item.label}
                        </p>
                        {planLoading ? (
                          <span className="inline-block h-6 w-12 animate-pulse rounded bg-slate-200" />
                        ) : item.unlimited ? (
                          <div className="flex items-center gap-1.5 text-blue-700">
                            <Infinity size={18} strokeWidth={2.5} />
                            <span className="text-sm font-black">Unlimited</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-xl font-black text-slate-900">
                              {item.used} <span className="text-sm font-semibold text-slate-400">/ {item.limit}</span>
                            </p>
                            {item.resetAt && (
                              <p className="mt-1 text-[10px] text-slate-400">
                                {planData?.usage?.planInterval === "yearly" ? "Resets" : "Until"}{" "}
                                {new Date(item.resetAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Latest payment / receipt */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.3)] backdrop-blur-sm sm:rounded-[2rem] sm:p-6"
                >
                  <div className="mb-5 flex items-center gap-2">
                    <div className="h-1 w-6 rounded-full bg-blue-600" />
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Latest Payment
                    </span>
                  </div>

                  {planLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-5 w-full animate-pulse rounded bg-slate-100" />
                      ))}
                    </div>
                  ) : planData?.latestPayment ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                          {
                            label: "Amount Paid",
                            value: formatAmount(planData.latestPayment.amount, planData.latestPayment.currency),
                          },
                          {
                            label: "Date",
                            value: formatDate(planData.latestPayment.createdAt),
                          },
                          {
                            label: "Payment ID",
                            value: planData.latestPayment.razorpayPaymentId,
                            mono: true,
                            truncate: true,
                          },
                          {
                            label: "Order ID",
                            value: planData.latestPayment.razorpayOrderId,
                            mono: true,
                            truncate: true,
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4"
                          >
                            <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                              {item.label}
                            </p>
                            <p
                              className={`text-sm font-semibold text-slate-900 ${
                                item.truncate ? "truncate" : ""
                              } ${item.mono ? "font-mono text-xs" : ""}`}
                            >
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => window.print()}
                        className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
                      >
                        <Receipt size={15} />
                        Print / Save Receipt
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No payment records found.</p>
                  )}
                </motion.div>
              </div>

            ) : (
              /* ── FREE STATE — purchase form ─────────────────────────── */
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

                {/* Plan selector */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="lg:col-span-3 space-y-4"
                >
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.3)] backdrop-blur-sm sm:rounded-[2rem] sm:p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <div className="h-1 w-6 rounded-full bg-blue-600" />
                      <span className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                        Choose Plan
                      </span>
                    </div>
                    <div className="space-y-3">
                      {planLoading ? (
                        [1, 2].map((i) => (
                          <div key={i} className="h-20 animate-pulse rounded-[1.25rem] bg-slate-100" />
                        ))
                      ) : availablePlans.map((plan) => {
                        const isSelected = selectedPlan === plan.planId;
                        const period = plan.interval === "yearly" ? "/year" : "/month";
                        const isYearly = plan.interval === "yearly";
                        return (
                          <button
                            key={plan.planId}
                            onClick={() => setSelectedPlan(plan.planId)}
                            className={`relative w-full rounded-[1.25rem] border-2 p-5 text-left transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50/60"
                                : "border-slate-200 bg-slate-50/60 hover:border-slate-300"
                            }`}
                          >
                            {isYearly && (
                              <span className="absolute right-4 top-4 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                                Save ~33%
                              </span>
                            )}
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-1">
                                  {plan.name}
                                </p>
                                <p className="text-2xl font-black text-slate-900">
                                  {formatPrice(plan.amount)}
                                  <span className="text-sm font-semibold text-slate-400">
                                    {period}
                                  </span>
                                </p>
                              </div>
                              <div
                                className={`h-5 w-5 shrink-0 rounded-full border-2 transition-all ${
                                  isSelected
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-slate-300"
                                }`}
                              >
                                {isSelected && (
                                  <Check size={12} className="text-white m-auto mt-0.5" />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.3)] backdrop-blur-sm sm:rounded-[2rem] sm:p-6">
                    <button
                      onClick={handleUpgrade}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[#1d4ed8] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1e40af] disabled:opacity-60 active:scale-98 sm:rounded-[1.1rem]"
                    >
                      {loading ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Zap size={17} />
                      )}
                      {loading ? "Opening checkout…" : "Upgrade Now"}
                    </button>
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                      <Shield size={11} />
                      Secured by Razorpay · UPI, Cards, Netbanking
                    </div>
                  </div>
                </motion.div>

                {/* Feature comparison */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="lg:col-span-2"
                >
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.3)] backdrop-blur-sm sm:rounded-[2rem] sm:p-6 h-full">
                    <div className="mb-5 flex items-center gap-2">
                      <div className="h-1 w-6 rounded-full bg-blue-600" />
                      <span className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                        What You Get
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {PRO_FEATURES.map((f) => (
                        <li key={f.label} className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100">
                            <Check size={11} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {f.label}
                            </p>
                            {f.free && (
                              <p className="text-xs text-slate-400">
                                Free: {f.free}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => navigate(-1)}
                      className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-100"
                    >
                      Maybe later
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Upgrade;
