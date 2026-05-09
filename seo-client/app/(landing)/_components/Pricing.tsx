import { Check } from "lucide-react";
import UpgradeButton from "./UpgradeButton";
import type { Plan } from "../_lib/plans";

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

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

interface PricingProps {
  monthly: Plan | null;
  yearly: Plan | null;
}

export default function Pricing({ monthly, yearly }: PricingProps) {
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
            Start free, scale when you&apos;re ready.
          </p>
        </div>

        <div className="mx-auto grid max-w-300 grid-cols-1 gap-20 md:grid-cols-2">
          {/* Free */}
          <div className="relative p-2">
            <div className="absolute top-0 left-[-3.5%] w-[107%] border border-dashed border-neutral-400"></div>
            <div className="absolute bottom-0 left-[-3.5%] w-[107%] border border-dashed border-neutral-400"></div>
            <div className="absolute -top-[2.5%] right-0 h-[105%] border border-dashed border-neutral-400"></div>
            <div className="absolute -top-[2.5%] left-0 h-[105%] border border-dashed border-neutral-400"></div>
            <article className="relative flex min-h-100 flex-col bg-white">
              <div className="m-2 border border-neutral-300 bg-[#ffff] p-8 shadow-sm">
                <h3
                  className="mb-3 text-4xl font-bold text-slate-900"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Base
                </h3>
                <p className="max-w-[16rem] text-xl leading-relaxed text-slate-600">
                  For individual developers and small projects getting started.
                </p>
              </div>

              <div className="flex flex-1 flex-col px-8 pt-10 pb-8">
                <div className="mb-3">
                  <span className="text-6xl leading-none font-bold text-slate-900">
                    Free
                  </span>
                  <span className="ml-2 text-2xl text-slate-500">forever</span>
                </div>
                <p className="mb-6 text-sm text-slate-500">
                  No credit card required. Upgrade anytime for more power.
                </p>

                <button
                  disabled
                  className="w-full cursor-not-allowed rounded-full border border-neutral-300 bg-transparent py-3 text-lg font-semibold text-neutral-300"
                >
                  Current Plan
                </button>

                <div className="mt-8 mb-7 border-t border-dashed border-neutral-300" />
                <p className="mb-5 text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                  Free plan includes
                </p>

                <ul className="mt-auto space-y-4">
                  {FREE_FEATURES.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 text-lg text-slate-700"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-slate-100 text-slate-700">
                        <Check size={12} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>

          {/* Pro */}
          <div className="relative p-2">
            <div className="absolute top-0 left-[-2.5%] w-[105%] border border-dashed border-neutral-600"></div>
            <div className="absolute bottom-0 left-[-2.5%] w-[105%] border border-dashed border-neutral-600"></div>
            <div className="absolute -top-[2.5%] right-0 h-[105%] border border-dashed border-neutral-600"></div>
            <div className="absolute -top-[2.5%] left-0 h-[105%] border border-dashed border-neutral-600"></div>
            <article className="relative flex min-h-100 flex-col bg-neutral-900">
              <div className="m-2 border border-neutral-700 bg-neutral-800 p-8 shadow-sm">
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
                    {monthly ? formatPrice(monthly.amount) : "₹499"}
                  </span>
                  <span className="ml-2 text-2xl text-neutral-400">/ Month</span>
                </div>
                <p className="mb-6 text-sm text-neutral-500">
                  or {yearly ? formatPrice(yearly.amount) : "₹3,999"} / year (save ~33%)
                </p>

                <UpgradeButton />

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
      </div>
    </section>
  );
}
