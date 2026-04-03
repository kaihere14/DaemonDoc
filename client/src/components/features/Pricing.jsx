import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const FREE_FEATURES = [
  "5 active repositories",
  "1 project review",
  "1 competitor analysis",
  "Auto README on every push",
  "Activity logs",
];

const PRO_FEATURES = [
  "Unlimited active repositories",
  "20 project reviews / month",
  "10 competitor analyses / month",
  "Priority AI generation queue",
  "Email support",
];

const formatPrice = (paise) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

const Pricing = () => {
  const navigate = useNavigate();
  const [monthlyPlan, setMonthlyPlan] = useState(null);
  const [yearlyPlan, setYearlyPlan] = useState(null);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/payments/plans`)
      .then(({ data }) => {
        setMonthlyPlan(data.plans.find((p) => p.planId === "pro_monthly"));
        setYearlyPlan(data.plans.find((p) => p.planId === "pro_yearly"));
      })
      .catch(() => {});
  }, []);

  return (
    <section
      id="pricing"
      className="py-20 lg:py-28 bg-linear-to-b from-white via-slate-50/50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-slate-600 font-light">
            Start free, scale when you're ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 max-w-5xl mx-auto">
          {/* Free */}
          <article className="rounded-[28px] border border-neutral-300 bg-neutral-100 shadow-2xl shadow-black/20 overflow-hidden flex flex-col min-h-155">
            <div className="m-2 rounded-3xl border border-neutral-300 bg-neutral-200 p-8">
              <h3
                className="text-4xl font-bold text-neutral-900 mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Free
              </h3>
              <p className="text-neutral-600 text-xl leading-relaxed max-w-[18rem]">
                Everything you need to automate your documentation, for free.
              </p>
            </div>

            <div className="px-8 pb-8 pt-10 flex flex-col flex-1">
              <div className="mb-3">
                <span className="text-6xl font-bold text-neutral-900 leading-none">₹0</span>
                <span className="text-neutral-500 text-2xl ml-2">/ Forever</span>
              </div>
              <p
                aria-hidden="true"
                className="text-neutral-500 text-sm mb-6 opacity-0 select-none"
              >
                &nbsp;
              </p>
              <button
                onClick={() => navigate("/login")}
                className="relative isolate w-full overflow-hidden py-3 rounded-full bg-black text-white text-lg font-semibold transition-colors hover:bg-neutral-900 after:content-[''] after:absolute after:inset-y-0 after:-left-1/2 after:w-1/2 after:skew-x-[-20deg] after:bg-white/30 after:blur-sm after:translate-x-[-180%] after:transition-transform after:duration-700 hover:after:translate-x-[320%]"
              >
                <span className="relative z-10">Start for Free</span>
              </button>

              <div className="mt-8 mb-7 border-t border-dashed border-neutral-300" />
              <p className="text-[11px] tracking-[0.18em] text-neutral-500 uppercase mb-5 font-semibold">
                Free plan includes
              </p>

              <ul className="space-y-4 mt-auto">
              {FREE_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-neutral-700 text-lg"
                >
                  <span className="w-5 h-5 rounded-full bg-neutral-300 border border-neutral-400 text-neutral-600 flex items-center justify-center shrink-0">
                    <Check size={12} />
                  </span>
                  {f}
                </li>
              ))}
              </ul>
            </div>
          </article>

          {/* Pro */}
          <article className="rounded-[28px] border border-neutral-800/80 bg-linear-to-br from-neutral-900 via-neutral-800 to-neutral-800 shadow-2xl shadow-black/30 overflow-hidden flex flex-col min-h-155">
            <div className="m-2 rounded-3xl border border-neutral-800 bg-linear-to-b from-neutral-900 to-neutral-950 p-8">
              <h3
                className="text-4xl font-bold text-neutral-100 mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Pro
              </h3>
              <p className="text-neutral-400 text-xl leading-relaxed max-w-[18rem]">
                For developers and teams who need unlimited power and speed.
              </p>
            </div>

            <div className="px-8 pb-8 pt-10 flex flex-col flex-1">
              <div className="mb-3">
                <span className="text-6xl font-bold text-white leading-none">
                  {monthlyPlan ? formatPrice(monthlyPlan.amount) : "₹499"}
                </span>
                <span className="text-neutral-400 text-2xl ml-2">/ Month</span>
              </div>
              <p className="text-neutral-500 text-sm mb-6">
                or {yearlyPlan ? formatPrice(yearlyPlan.amount) : "₹3,999"} / year
                (save ~33%)
              </p>

              <button
                onClick={() => navigate("/upgrade")}
                className="relative isolate w-full overflow-hidden py-3 rounded-full bg-blue-600 text-white text-lg font-semibold transition-all hover:brightness-110 after:content-[''] after:absolute after:inset-y-0 after:-left-1/2 after:w-1/2 after:skew-x-[-20deg] after:bg-white/40 after:blur-sm after:translate-x-[-180%] after:transition-transform after:duration-700 hover:after:translate-x-[320%]"
              >
                <span className="relative z-10">Upgrade to Pro</span>
              </button>

              <div className="mt-8 mb-7 border-t border-dashed border-neutral-700" />
              <p className="text-[11px] tracking-[0.18em] text-neutral-500 uppercase mb-5 font-semibold">
                Pro plan includes
              </p>

              <ul className="space-y-4 mt-auto">
              {PRO_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-neutral-300 text-lg"
                >
                  <span className="w-5 h-5 rounded-full bg-neutral-700/70 border border-neutral-600/80 text-neutral-300 flex items-center justify-center shrink-0">
                    <Check size={12} />
                  </span>
                  {f}
                </li>
              ))}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
