import EngineCard from "./EngineCard";
import { Key } from "@/app/(landing)/_animate-ui/icons/key";
import { Search } from "@/app/(landing)/_animate-ui/icons/search";
import { LayersIcon } from "@/app/(landing)/_animate-ui/icons/layers";
import { PlugZap } from "@/app/(landing)/_animate-ui/icons/plug-zap";
import { Disc3 } from "@/app/(landing)/_animate-ui/icons/disc-3";
import { Hammer } from "@/app/(landing)/_animate-ui/icons/hammer";

type AnimateIconComponent = React.ComponentType<Record<string, unknown>>;

const ENGINE_FEATURES: {
  icon: AnimateIconComponent;
  animation: string;
  title: string;
  desc: string;
  iconClass: string;
}[] = [
  {
    icon: Key as AnimateIconComponent,
    animation: "path",
    title: "GitHub OAuth 2.0",
    desc: "Secure handshake protocols ensuring precise permission scoping for your private repositories.",
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    icon: PlugZap as AnimateIconComponent,
    animation: "path",
    title: "Context Synthesis",
    desc: "Advanced RAG-based engine that aggregates cross-file dependencies for holistic doc generation.",
    iconClass: "bg-sky-50 text-sky-600",
  },
  {
    icon: Search as AnimateIconComponent,
    animation: "path",
    title: "Differential Scan",
    desc: "Compute-efficient audits that only process modified AST nodes to minimize latency.",
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: LayersIcon as AnimateIconComponent,
    animation: "path",
    title: "Commit Isolation",
    desc: "Granular tracking of change-sets to provide accurate version histories within your README.",
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    icon: Hammer as AnimateIconComponent,
    animation: "path",
    title: "Monorepo Native",
    desc: "Seamless handling of complex workspaces including Turborepo, Lerna, and Nx structures.",
    iconClass: "bg-rose-50 text-rose-600",
  },
  {
    icon: Disc3 as AnimateIconComponent,
    animation: "path",
    title: "Logic Exclusions",
    desc: "Smart filtering to omit boilerplate, tests, and sensitive configuration from public docs.",
    iconClass: "bg-violet-50 text-violet-600",
  },
];

export default function EngineSection() {
  return (
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
}
