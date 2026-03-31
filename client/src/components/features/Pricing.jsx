import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Check, Crown } from "lucide-react";

const FREE_FEATURES = [
  "5 active repositories",
  "1 project review / month",
  "1 competitor analysis / month",
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

const Pricing = () => {
  const navigate = useNavigate();

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Free */}
          <div className="relative p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-6">
              <Zap size={22} />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
              Free
            </p>
            <h3
              className="text-xl font-bold text-slate-900 mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Get Started
            </h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Everything you need to automate your documentation, for free.
            </p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-slate-900">₹0</span>
              <span className="text-slate-400 text-sm"> / forever</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {FREE_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2.5 text-sm text-slate-600"
                >
                  <Check size={14} className="text-slate-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-full border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              Start for Free
            </button>
          </div>

          {/* Pro */}
          <div className="relative p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
            <span className="absolute top-6 right-6 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Most Popular
            </span>
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
              <Crown size={22} />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
              Pro
            </p>
            <h3
              className="text-xl font-bold text-white mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Scale Up
            </h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              For developers and teams who need unlimited power and speed.
            </p>
            <div className="mb-2">
              <span className="text-4xl font-bold text-white">₹499</span>
              <span className="text-slate-400 text-sm"> / month</span>
            </div>
            <p className="text-slate-500 text-xs mb-8">or ₹3,999 / year (save ~33%)</p>
            <ul className="space-y-3 mb-8 flex-1">
              {PRO_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2.5 text-sm text-slate-300"
                >
                  <Check size={14} className="text-blue-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/upgrade")}
              className="w-full py-3 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25"
            >
              Upgrade to Pro
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Pricing;
