import React from "react";
import { Brain, Webhook, ShieldCheck, Key, Share2, GitCompare, Layers, GitBranch, Filter, Code2, Cloud, Zap, Boxes, Hexagon, Check, Building2 } from "lucide-react";

/* ─────────────────────────────────────────
   SECTION 1 — Core Capabilities (3 cards)
───────────────────────────────────────── */
const CORE_FEATURES = [
  {
    icon: Brain,
    title: "Intelligent Code Analysis",
    desc: ["Powered by the latest ", "LLaMA 3.3 70B", " integration, our engine deeply understands your codebase structure, logic, and intent to generate human-quality documentation."],
    iconClass: "text-blue-600",
    gradientClass: "feature-gradient-1",
  },
  {
    icon: Webhook,
    title: "Real-time Webhook Integration",
    desc: ["The ", "push once, sync forever", " promise. We listen for git events in real-time, ensuring your README is never out of date with your actual code."],
    iconClass: "bg-sky-50 text-sky-600",
    gradientClass: "feature-gradient-2",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-Grade Security",
    desc: ["Your code stays yours. All GitHub tokens and repository access keys are protected with bank-level ", "AES-256 encryption", " at rest and in transit."],
    iconClass: " text-emerald-600",
    gradientClass: "feature-gradient-3",
  },
];

const CoreCapabilities = () => (
  <section
    id="features"
    className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-slate-50 to-white"
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
          Everything you need to maintain perfect documentation without lifting a finger.
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

/* ─────────────────────────────────────────
   SECTION 2 — Social Proof strip
───────────────────────────────────────── */
const COMPANIES = [
  { icon: Code2, name: "ACME Corp" },
  { icon: Cloud, name: "Nebula" },
  { icon: Zap, name: "FlashDev" },
  { icon: Boxes, name: "Stacker" },
  { icon: Hexagon, name: "Polymer" },
];

const SocialProof = () => (
  <section className="py-12 border-t border-slate-100 bg-white">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
        Trusted by developers at
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
        {COMPANIES.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-1.5 text-lg font-bold text-slate-800"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <c.icon size={18} />
            {c.name}
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────
   SECTION 3 — Everything The Engine Does (6 cards)
───────────────────────────────────────── */
const ENGINE_FEATURES = [
  {
    icon: Key,
    title: "GitHub OAuth 2.0",
    desc: "Secure handshake protocols ensuring precise permission scoping for your private repositories.",
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    icon: Share2,
    title: "Context Synthesis",
    desc: "Advanced RAG-based engine that aggregates cross-file dependencies for holistic doc generation.",
    iconClass: "bg-sky-50 text-sky-600",
  },
  {
    icon: GitCompare,
    title: "Differential Scan",
    desc: "Compute-efficient audits that only process modified AST nodes to minimize latency.",
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Layers,
    title: "Commit Isolation",
    desc: "Granular tracking of change-sets to provide accurate version histories within your README.",
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    icon: GitBranch,
    title: "Monorepo Native",
    desc: "Seamless handling of complex workspaces including Turborepo, Lerna, and Nx structures.",
    iconClass: "bg-rose-50 text-rose-600",
  },
  {
    icon: Filter,
    title: "Logic Exclusions",
    desc: "Smart filtering to omit boilerplate, tests, and sensitive configuration from public docs.",
    iconClass: "bg-violet-50 text-violet-600",
  },
];

const EngineSection = () => (
  <section id="engine" className="py-20 lg:py-28 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2
          className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 uppercase tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Everything the Engine Does
        </h2>
        <p className="text-lg text-slate-600 font-light">
          Deep-tech capabilities powering the next generation of automated documentation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ENGINE_FEATURES.map((f) => (
          <div
            key={f.title}
            className="group p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all duration-300"
          >
            <div
              className={`w-12 h-12 ${f.iconClass} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
            >
              <f.icon size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2 uppercase tracking-wide">
              {f.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────
   SECTION 4 — Pricing
───────────────────────────────────────── */
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
  <section id="pricing" className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white">
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
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
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
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Enterprise</p>
          <div className="mb-2">
            <span className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Custom</span>
          </div>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            For organizations requiring custom SLAs, compliance, and dedicated support.
          </p>
          <ul className="space-y-3 mb-8 flex-1">
            {ENTERPRISE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
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

/* ─────────────────────────────────────────
   Default export — composes all 4 sections
───────────────────────────────────────── */
const Features = () => (
  <>
    <CoreCapabilities />
    <SocialProof />
    <Pricing />
    <EngineSection />
  </>
);

export default Features;
