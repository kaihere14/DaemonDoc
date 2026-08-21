import { Brain, Webhook, ShieldCheck } from "lucide-react";
import { SECTION_X, SECTION_Y } from "@/app/(landing)/_lib/section";

const CORE_FEATURES = [
  {
    icon: Brain,
    title: "Intelligent Code Analysis",
    desc: [
      "Powered by the latest ",
      "Gemini 3.1 Flash Lite",
      " integration, our engine deeply understands your codebase structure, logic, and intent to generate human-quality documentation.",
    ],
    iconClass: "bg-[#EAF4FF] text-[#005FD6]",
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
    iconClass: "bg-[#EAF4FF] text-[#209BFF]",
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
    iconClass: "bg-emerald-50 text-emerald-600",
    gradientClass: "feature-gradient-3",
  },
];

export default function CoreCapabilities() {
  return (
    <section
      id="features"
      className={`relative overflow-hidden bg-linear-to-b from-white via-slate-50/50 to-white ${SECTION_Y}`}
    >
      <div className={SECTION_X}>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="font-display mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
            Core Capabilities
          </h2>
          <p className="text-lg font-light tracking-[-0.012em] text-slate-600">
            Everything you need to maintain perfect documentation without lifting
            a finger.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          {CORE_FEATURES.map((f) => (
            <div
              key={f.title}
              className={`group relative bg-white p-8 ${f.gradientClass}`}
            >
              <div className="pointer-events-none absolute top-0 -left-4 w-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>
              <div className="pointer-events-none absolute -top-4 left-0 h-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>
              <div className="pointer-events-none absolute -top-4 right-0 h-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>
              <div className="pointer-events-none absolute bottom-0 -left-4 w-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>

              <div
                className={`h-14 w-14 ${f.iconClass} mb-6 flex items-center justify-center rounded-xl`}
              >
                <f.icon size={28} />
              </div>
              <h3 className="font-display mb-3 text-xl font-bold text-slate-900">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
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
}
