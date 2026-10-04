import type { Metadata } from "next";
import { Code2, Boxes, Building2 } from "lucide-react";
import { SubPageShell, PageHeader, CtaBand } from "../_components/SubPage";
import Steps from "../_components/Steps";
import CoreCapabilities from "../_components/CoreCapabilities";
import { SECTION_X, SECTION_Y } from "@/app/(landing)/_lib/section";

export const metadata: Metadata = {
  title: "Solutions - DaemonDoc",
  description:
    "How DaemonDoc keeps README files accurate for solo developers, monorepo teams, and security-conscious organisations — automatically, on every push.",
  alternates: { canonical: "https://www.daemondoc.online/solutions" },
};

const AUDIENCES = [
  {
    icon: Code2,
    title: "Solo developers & maintainers",
    desc: "Ship features, not docs. Your open-source README stays accurate for every new contributor without a single manual edit.",
    iconClass: "bg-[#EAF4FF] text-[#005FD6]",
    gradientClass: "feature-gradient-1",
  },
  {
    icon: Boxes,
    title: "Product teams & monorepos",
    desc: "Turborepo, Nx and Lerna workspaces are understood as a whole, so each package's docs reflect how it fits into the rest.",
    iconClass: "bg-[#EAF4FF] text-[#209BFF]",
    gradientClass: "feature-gradient-2",
  },
  {
    icon: Building2,
    title: "Security-conscious orgs",
    desc: "Scoped GitHub OAuth, encrypted tokens and smart exclusions keep secrets and internal config out of public documentation.",
    iconClass: "bg-emerald-50 text-emerald-600",
    gradientClass: "feature-gradient-3",
  },
];

export default function SolutionsPage() {
  return (
    <SubPageShell>
      <PageHeader
        eyebrow="Solutions"
        title="Documentation that keeps up with your code"
        description="Whether you maintain one side project or a fleet of services, DaemonDoc turns every push into an up-to-date README."
      />

      <section className={SECTION_Y}>
        <div className={SECTION_X}>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="font-display mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Built for how you work
            </h2>
            <p className="text-lg font-light tracking-[-0.012em] text-slate-600">
              One engine, tuned for every size of codebase.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
            {AUDIENCES.map((a) => (
              <div
                key={a.title}
                className={`relative bg-white p-8 ${a.gradientClass}`}
              >
                <div className="pointer-events-none absolute top-0 -left-4 w-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>
                <div className="pointer-events-none absolute -top-4 left-0 h-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>
                <div className="pointer-events-none absolute -top-4 right-0 h-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>
                <div className="pointer-events-none absolute bottom-0 -left-4 w-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>

                <div
                  className={`h-14 w-14 ${a.iconClass} mb-6 flex items-center justify-center rounded-xl`}
                >
                  <a.icon size={28} />
                </div>
                <h3 className="font-display mb-3 text-xl font-bold text-slate-900">
                  {a.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={`${SECTION_X} pb-14 lg:pb-20`}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold text-slate-900 md:text-4xl">
            Three steps, then it runs itself
          </h2>
        </div>
        <Steps />
      </div>

      <CoreCapabilities />
      <CtaBand />
    </SubPageShell>
  );
}
