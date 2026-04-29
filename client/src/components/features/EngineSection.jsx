import React, { useState } from "react";
import { Share2, GitCompare, Layers, GitBranch, Filter } from "lucide-react";
import { Key } from "@/components/animate-ui/icons/key";
import { Search } from "../animate-ui/icons/search";
import { LayersIcon } from "../animate-ui/icons/layers";
import { Slot } from "../animate-ui/primitives/animate/slot";
import { PlugZap } from "../animate-ui/icons/plug-zap";
import { Disc3 } from "../animate-ui/icons/disc-3";
import { Hammer } from "../animate-ui/icons/hammer";

const ENGINE_FEATURES = [
  {
    icon: Key,
    animation: "path",
    title: "GitHub OAuth 2.0",
    desc: "Secure handshake protocols ensuring precise permission scoping for your private repositories.",
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    icon: PlugZap,
    animation: "path",
    title: "Context Synthesis",
    desc: "Advanced RAG-based engine that aggregates cross-file dependencies for holistic doc generation.",
    iconClass: "bg-sky-50 text-sky-600",
  },
  {
    icon: Search,
    animation: "path",
    title: "Differential Scan",
    desc: "Compute-efficient audits that only process modified AST nodes to minimize latency.",
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: LayersIcon,
    animation: "path",
    title: "Commit Isolation",
    desc: "Granular tracking of change-sets to provide accurate version histories within your README.",
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    icon: Hammer,
    animation: "path",
    title: "Monorepo Native",
    desc: "Seamless handling of complex workspaces including Turborepo, Lerna, and Nx structures.",
    iconClass: "bg-rose-50 text-rose-600",
  },
  {
    icon: Disc3,
    animation: "path",
    title: "Logic Exclusions",
    desc: "Smart filtering to omit boilerplate, tests, and sensitive configuration from public docs.",
    iconClass: "bg-violet-50 text-violet-600",
  },
];

const EngineCard = ({ f }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40 transition-all duration-300 hover:shadow-slate-300/60"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`h-12 w-12 ${f.iconClass} mb-6 flex items-center justify-center rounded-xl transition-transform duration-300`}
      >
        {f.animation ? (
          <f.icon size={22} animate={hovered ? f.animation : false} />
        ) : (
          <f.icon size={22} />
        )}
      </div>
      <h3 className="mb-2 text-base font-bold tracking-wide text-slate-900 uppercase">
        {f.title}
      </h3>
      <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
    </div>
  );
};

const EngineSection = () => (
  <section
    id="engine"
    className="bg-linear-to-b from-white via-slate-50/50 to-white py-20 lg:py-28"
  >
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <h2
          className="mb-4 text-3xl font-bold tracking-tight text-slate-900 uppercase md:text-4xl"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Everything the Engine Does
        </h2>
        <p className="text-lg font-light text-slate-600">
          Deep-tech capabilities powering the next generation of automated
          documentation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {ENGINE_FEATURES.map((f) => (
          <EngineCard key={f.title} f={f} />
        ))}
      </div>
    </div>
  </section>
);

export default EngineSection;
