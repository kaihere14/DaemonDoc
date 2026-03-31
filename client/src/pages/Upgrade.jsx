import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap, Check, ArrowLeft, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import AuthNavigation from "../components/AuthNavigation";
import SEO from "../components/SEO";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { useAuth } from "../context/AuthContext";
import { api, ENDPOINTS } from "../lib/api";

const PLANS = [
  {
    id: "pro_monthly",
    label: "Pro Monthly",
    price: "₹499",
    period: "/month",
    savings: null,
    features: [
      "Unlimited active repositories",
      "20 project reviews",
      "10 competitor analyses",
      "Priority AI generation",
      "Email support",
    ],
  },
  {
    id: "pro_yearly",
    label: "Pro Yearly",
    price: "₹3,999",
    period: "/year",
    savings: "Save ~33%",
    features: [
      "Unlimited active repositories",
      "20 project reviews",
      "10 competitor analyses",
      "Priority AI generation",
      "Email support",
    ],
  },
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

      // Create order on backend
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
        theme: {
          color: "#4f46e5",
        },
        handler: async (response) => {
          try {
            // Verify payment on backend
            await api.post(ENDPOINTS.PAYMENT_VERIFY, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: selectedPlan,
            });

            // Update local user state so UI reflects pro plan immediately
            setUser((prev) => ({ ...prev, plan: "pro" }));

            toast.success("Pro plan activated! Welcome aboard.");
            navigate("/home");
          } catch {
            toast.error(
              "Payment received but activation failed. Please contact support.",
            );
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
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

  return (
    <>
      <SEO
        title="Upgrade to Pro — DaemonDoc"
        description="Unlock unlimited repositories, more reviews and competitor analyses with DaemonDoc Pro."
        ogUrl="https://daemondoc.online/upgrade"
        canonical="https://daemondoc.online/upgrade"
      />
      <div className="min-h-screen bg-linear-to-b from-white via-slate-50/70 to-white text-slate-900 font-sans">
        <AuthNavigation />

        <div className="relative px-4 pb-14 pt-22 sm:px-6 sm:pb-16 sm:pt-24">
          {/* Bg blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-24 left-[-8rem] h-72 w-72 rounded-full bg-indigo-100/50 blur-3xl" />
            <div className="absolute top-52 right-[-6rem] h-80 w-80 rounded-full bg-blue-100/40 blur-3xl" />
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Back */}
            <button
              onClick={() => navigate(-1)}
              className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-10 text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-600">
                <Zap size={12} />
                Upgrade
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 sm:text-5xl">
                Go Pro
              </h1>
              <p className="mt-3 text-sm text-slate-500 sm:text-base">
                Unlock unlimited repos and advanced features.
              </p>
            </motion.div>

            {/* Plan cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {PLANS.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative w-full rounded-3xl border-2 p-6 text-left transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/60 shadow-lg shadow-indigo-100"
                        : "border-slate-200 bg-white hover:border-indigo-200"
                    }`}
                  >
                    {plan.savings && (
                      <span className="absolute right-4 top-4 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                        {plan.savings}
                      </span>
                    )}
                    <p className="mb-1 text-xs font-black uppercase tracking-widest text-slate-400">
                      {plan.label}
                    </p>
                    <p className="mb-4 text-3xl font-black text-slate-900">
                      {plan.price}
                      <span className="text-sm font-semibold text-slate-400">
                        {plan.period}
                      </span>
                    </p>
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-sm text-slate-600"
                        >
                          <Check size={14} className="shrink-0 text-indigo-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {isSelected && (
                      <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                        <div className="h-2 w-2 rounded-full bg-indigo-500" />
                        Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center"
            >
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Zap size={18} />
                )}
                {loading ? "Opening checkout…" : "Upgrade Now"}
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Shield size={12} />
                Secured by Razorpay · UPI, Cards, Netbanking accepted
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upgrade;
