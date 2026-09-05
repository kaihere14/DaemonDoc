"use client";
import type { FC } from "react";
import { AnimateIcon } from "../_animate-ui/icons/icon";
import { Unplug } from "../_animate-ui/icons/unplug";
import { Activity } from "../_animate-ui/icons/activity";
import { ClipboardCheck } from "../_animate-ui/icons/clipboard-check";

const STEPS = [
  {
    Icon: (props: Record<string, unknown>) => <Unplug {...props} />,
    title: "Connect Repo",
    desc: "Link your GitHub repository once",
    iconClass: "bg-[#D6EAFF] text-[#005FD6] border-[#A9D3FF]",
  },
  {
    Icon: (props: Record<string, unknown>) => <Activity {...props} />,
    title: "Push Code",
    desc: "Just code & commit as usual",
    iconClass: "bg-[#D6EAFF] text-[#005FD6] border-[#A9D3FF]",
  },
  {
    Icon: (props: Record<string, unknown>) => <ClipboardCheck {...props} />,
    title: "README Updates",
    desc: "Docs sync automatically instantly",
    iconClass: "bg-emerald-100 text-emerald-600 border-emerald-200",
  },
];

const Steps: FC = () => {
  return (
    <section aria-labelledby="hero-steps" className="mx-auto mt-16 max-w-4xl">
      <h2 id="hero-steps" className="sr-only">
        How DaemonDoc works
      </h2>
      <div className="relative grid grid-cols-1 gap-10 text-center md:grid-cols-3">
        {STEPS.map((step, i) => (
          <AnimateIcon key={i} animateOnHover asChild>
            <div className="group relative z-10 border-neutral-200 bg-white p-4">
              <div className="pointer-events-none absolute top-0 -left-4 w-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>
              <div className="pointer-events-none absolute -top-4 left-0 h-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>
              <div className="pointer-events-none absolute -top-4 right-0 h-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>
              <div className="pointer-events-none absolute bottom-0 -left-4 w-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>

              <div
                className={`h-12 w-12 ${step.iconClass} mx-auto mb-3 flex items-center justify-center rounded-full border shadow-sm transition-shadow group-hover:shadow-md`}
              >
                <step.Icon size={24} />
              </div>
              <h3 className="font-display font-bold text-slate-900">
                {i + 1}. {step.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{step.desc}</p>
            </div>
          </AnimateIcon>
        ))}
      </div>
    </section>
  );
};

export default Steps;
