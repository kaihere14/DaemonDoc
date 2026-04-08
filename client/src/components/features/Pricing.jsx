import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import axios from "axios";
import { usePostHog } from "@posthog/react";

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
  const posthog = usePostHog();
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
      className="bg-linear-to-b from-white via-slate-50/50 to-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2
            className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg font-light text-slate-600">
            Start free, scale when you're ready.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-7 md:grid-cols-2">
          {/* Free */}
          <article className="flex min-h-155 flex-col overflow-hidden rounded-[28px] border border-neutral-300 bg-neutral-100 shadow-2xl shadow-black/20">
            <div className="m-2 rounded-3xl border border-neutral-300 bg-neutral-200 p-8">
              <h3
                className="mb-3 text-4xl font-bold text-neutral-900"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Free
              </h3>
              <p className="max-w-[18rem] text-xl leading-relaxed text-neutral-600">
                Everything you need to automate your documentation, for free.
              </p>
            </div>

            <div className="flex flex-1 flex-col px-8 pt-10 pb-8">
              <div className="mb-3">
                <span className="text-6xl leading-none font-bold text-neutral-900">
                  ₹0
                </span>
                <span className="ml-2 text-2xl text-neutral-500">
                  / Forever
                </span>
              </div>
              <p
                aria-hidden="true"
                className="mb-6 text-sm text-neutral-500 opacity-0 select-none"
              >
                &nbsp;
              </p>
              <button
                onClick={() => navigate("/login")}
                className="relative isolate w-full cursor-pointer overflow-hidden rounded-full bg-black py-3 text-lg font-semibold text-white transition-colors after:absolute after:inset-y-0 after:-left-1/2 after:w-1/2 after:translate-x-[-180%] after:skew-x-[-20deg] after:bg-white/30 after:blur-sm after:transition-transform after:duration-700 after:content-[''] hover:bg-neutral-900 hover:after:translate-x-[320%]"
              >
                <span className="relative z-10">Start for Free</span>
              </button>

              <div className="mt-8 mb-7 border-t border-dashed border-neutral-300" />
              <p className="mb-5 text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                Free plan includes
              </p>

              <ul className="mt-auto space-y-4">
                {FREE_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-lg text-neutral-700"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-400 bg-neutral-300 text-neutral-600">
                      <Check size={12} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          {/* Pro */}
          <article className="flex min-h-155 flex-col overflow-hidden rounded-[28px] border border-neutral-800/80 bg-linear-to-br from-neutral-900 via-neutral-800 to-neutral-800 shadow-2xl shadow-black/30">
            <div className="m-2 rounded-3xl border border-neutral-800 bg-linear-to-b from-neutral-900 to-neutral-950 p-8">
              <h3
                className="mb-3 text-4xl font-bold text-neutral-100"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Pro
              </h3>
              <p className="max-w-[18rem] text-xl leading-relaxed text-neutral-400">
                For developers and teams who need unlimited power and speed.
              </p>
            </div>

            <div className="flex flex-1 flex-col px-8 pt-10 pb-8">
              <div className="mb-3">
                <span className="text-6xl leading-none font-bold text-white">
                  {monthlyPlan ? formatPrice(monthlyPlan.amount) : "₹499"}
                </span>
                <span className="ml-2 text-2xl text-neutral-400">/ Month</span>
              </div>
              <p className="mb-6 text-sm text-neutral-500">
                or {yearlyPlan ? formatPrice(yearlyPlan.amount) : "₹3,999"} /
                year (save ~33%)
              </p>

              <button
                onClick={() => {
                  posthog?.capture("pricing_cta_clicked", { plan: "pro" });
                  navigate("/upgrade");
                }}
                className="relative isolate w-full cursor-pointer overflow-hidden rounded-full bg-blue-600 py-3 text-lg font-semibold text-white transition-all after:absolute after:inset-y-0 after:-left-1/2 after:w-1/2 after:translate-x-[-180%] after:skew-x-[-20deg] after:bg-white/40 after:blur-sm after:transition-transform after:duration-700 after:content-[''] hover:brightness-110 hover:after:translate-x-[320%]"
              >
                <span className="relative z-10">Upgrade to Pro</span>
              </button>

              <div className="mt-8 mb-7 border-t border-dashed border-neutral-700" />
              <p className="mb-5 text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                Pro plan includes
              </p>

              <ul className="mt-auto space-y-4">
                {PRO_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-lg text-neutral-300"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-600/80 bg-neutral-700/70 text-neutral-300">
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
