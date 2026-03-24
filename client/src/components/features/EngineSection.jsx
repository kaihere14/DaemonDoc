import React from "react";
import { Key, Share2, GitCompare, Layers, GitBranch, Filter } from "lucide-react";

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
  <section
    id="engine"
    className="py-20 lg:py-28 bg-linear-to-b from-white via-slate-50/50 to-white"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2
          className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 uppercase tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Everything the Engine Does
        </h2>
        <p className="text-lg text-slate-600 font-light">
          Deep-tech capabilities powering the next generation of automated
          documentation.
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

export default EngineSection;
