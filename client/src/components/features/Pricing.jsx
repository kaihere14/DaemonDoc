import React from "react";
import { Zap, Check } from "lucide-react";

const PRO_FEATURES = [
  "Unlimited repositories",
  "Priority generation queue",
  "Advanced README templates",
  "Email support",
];

const ENTERPRISE_FEATURES = [
  "Everything in Pro",
  "SSO & SAML integration",
  "Custom AI model fine-tuning",
  "Dedicated SLA & support",
];

const Pricing = () => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Pro */}
        <div className="relative p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
          <span className="absolute top-6 right-6 text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            Coming Soon
          </span>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
            <Zap size={22} />
          </div>
          <h3
            className="text-xl font-bold text-slate-900 mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Pro
          </h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            For individual developers and small teams who want to move fast.
          </p>
          <div className="mb-8">
            <span className="text-4xl font-bold text-slate-900">$4.99</span>
            <span className="text-slate-400 text-sm"> / mo</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {PRO_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2.5 text-sm text-slate-600"
              >
                <Check size={14} className="text-[#1d4ed8] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button
            disabled
            className="w-full py-3 rounded-full border border-slate-200 text-slate-400 text-sm font-medium cursor-not-allowed"
          >
            Notify Me
          </button>
        </div>

        {/* Enterprise */}
        <div className="relative p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
          <span className="absolute top-6 right-6 text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-slate-400">
            Coming Soon
          </span>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Enterprise
          </p>
          <div className="mb-2">
            <span
              className="text-4xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Custom
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            For organizations requiring custom SLAs, compliance, and dedicated
            support.
          </p>
          <ul className="space-y-3 mb-8 flex-1">
            {ENTERPRISE_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2.5 text-sm text-slate-400"
              >
                <Check size={14} className="text-slate-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button
            disabled
            className="w-full py-3 rounded-full border border-slate-700 text-slate-500 text-sm font-medium cursor-not-allowed bg-slate-800"
          >
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default Pricing;
