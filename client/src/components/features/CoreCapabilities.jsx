import React from "react";
import { Brain, Webhook, ShieldCheck } from "lucide-react";

const CORE_FEATURES = [
  {
    icon: Brain,
    title: "Intelligent Code Analysis",
    desc: [
      "Powered by the latest ",
      "Gemini 3.1 Flash Lite",
      " integration, our engine deeply understands your codebase structure, logic, and intent to generate human-quality documentation.",
    ],
    iconClass: "text-blue-600",
    gradientClass: "feature-gradient-1",
  },
  {
    icon: Webhook,
    title: "Real-time Webhook Integration",
    desc: [
      "The ",
      "push once, sync forever",
      " promise. We listen for git events in real-time, ensuring your README is never out of date with your actual code.",
    ],
    iconClass: "bg-sky-50 text-sky-600",
    gradientClass: "feature-gradient-2",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-Grade Security",
    desc: [
      "Your code stays yours. All GitHub tokens and repository access keys are protected with bank-level ",
      "AES-256 encryption",
      " at rest and in transit.",
    ],
    iconClass: " text-emerald-600",
    gradientClass: "feature-gradient-3",
  },
];

const CoreCapabilities = () => (
  <section
    id="features"
    className="pt-22 pb-20 lg:pt-12 lg:pb-28 relative overflow-hidden bg-linear-to-b from-white via-slate-50/50 to-white"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2
          className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Core Capabilities
        </h2>
        <p className="text-lg text-slate-600 font-light">
          Everything you need to maintain perfect documentation without lifting
          a finger.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {CORE_FEATURES.map((f) => (
          <div
            key={f.title}
            className={`group relative p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 ${f.gradientClass}`}
          >
            <div
              className={`w-14 h-14 ${f.iconClass} rounded-xl flex items-center justify-center mb-6`}
            >
              <f.icon size={28} />
            </div>
            <h3
              className="text-xl font-bold text-slate-900 mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {f.title}
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {f.desc[0]}
              <strong>{f.desc[1]}</strong>
              {f.desc[2]}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CoreCapabilities;
