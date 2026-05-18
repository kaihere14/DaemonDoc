import React from "react";
import { motion } from "framer-motion";
import {
  Github,
  Play,
  FileCode,
  CheckCircle2,
  Zap,
  ArrowRight,
  GitPullRequest,
  ChevronDown,
} from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      code: "AUTH_INIT",
      icon: <Github size={20} />,
      title: "Handshake",
      desc: "Secure OAuth connection to your GitHub profile.",
    },
    {
      code: "WEBHOOK_SYNC",
      icon: <Zap size={20} />,
      title: "Listen",
      desc: "Enable specific repos. We attach a silent observer.",
    },
    {
      code: "AST_ANALYSIS",
      icon: <FileCode size={20} />,
      title: "Crawl",
      desc: "On every push, we map your logic tree recursively.",
    },
    {
      code: "DOC_COMMIT",
      icon: <CheckCircle2 size={20} />,
      title: "Ship",
      desc: "Fresh README.md committed via automated PR.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="overflow-hidden border-t border-slate-100 bg-white py-20 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
        {/* Header: Fixed for mobile scaling */}
        <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end lg:mb-24">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-4 flex items-center gap-3 lg:mb-6"
            >
              <div className="h-2 w-2 rounded-full bg-slate-900" />
              <span className="font-mono text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                System_Workflow // v0.4
              </span>
            </motion.div>
            <h2 className="text-4xl leading-[0.85] font-black tracking-tighter uppercase sm:text-5xl lg:text-7xl">
              The Protocol.
            </h2>
          </div>
          <div className="hidden pb-2 text-right lg:block">
            <p className="font-mono text-[10px] leading-relaxed font-bold text-slate-300 uppercase">
              [ Input: Raw Code ] <br />
              [ Processing: LLM + AST Explorer ] <br />[ Output: Structured
              Documentation ]
            </p>
          </div>
        </div>

        {/* The Pipeline Interface */}
        <div className="relative">
          {/* Desktop Connecting Line (Horizontal) */}
          <div className="absolute top-[39px] left-0 hidden h-px w-full bg-slate-100 lg:block" />

          {/* Mobile Connecting Line (Vertical) */}
          <div className="absolute top-0 left-[39px] h-full w-px bg-slate-100 lg:hidden" />

          <div className="relative z-10 grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-12">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group flex gap-6 lg:flex-col lg:gap-0"
              >
                {/* Visual Node */}
                <div className="flex shrink-0 flex-col items-center lg:mb-8 lg:items-start">
                  <div className="relative">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 bg-white transition-all duration-500 lg:h-20 lg:w-20 ${idx === 2 ? "border-slate-900 shadow-xl lg:shadow-2xl" : "border-slate-100 group-hover:border-slate-300"} `}
                    >
                      {React.cloneElement(step.icon, {
                        className:
                          idx === 2
                            ? "text-slate-900"
                            : "text-slate-300 group-hover:text-slate-900",
                      })}
                    </div>
                    {/* Signal Dot */}
                    <div
                      className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${idx === 2 ? "animate-pulse bg-blue-500" : "bg-slate-200"} `}
                    />
                  </div>

                  {/* Flow Indicator (Chevron for mobile, Arrow for desktop) */}
                  <div className="mt-4 lg:hidden">
                    {idx < 3 && (
                      <ChevronDown className="text-slate-100" size={20} />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3 pt-2 lg:space-y-4 lg:pt-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] font-black text-slate-300">
                      0{idx + 1}
                    </span>
                    <span className="rounded border border-slate-100 bg-slate-50 px-2 py-0.5 font-mono text-[9px] font-black text-slate-400 uppercase">
                      {step.code}
                    </span>
                  </div>

                  <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase transition-colors group-hover:text-blue-600 lg:text-xl">
                    {step.title}
                  </h3>

                  <p className="text-sm leading-relaxed font-medium text-slate-500 lg:max-w-[240px]">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Technical Footer: Adjusted for mobile stacking */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-16 flex flex-col items-center justify-between gap-6 rounded-3xl border border-slate-100 bg-slate-50/50 p-6 md:flex-row lg:mt-24 lg:rounded-[2rem] lg:p-8"
        >
          <div className="flex w-full items-center gap-4 md:w-auto lg:gap-6">
            <div className="shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <GitPullRequest size={20} className="text-slate-400" />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Latest Operation
              </p>
              <p className="line-clamp-1 font-mono text-[11px] font-bold text-slate-900 lg:text-xs">
                PR #842: Documentation Update — /src/core/auth.ts
              </p>
            </div>
          </div>

          {/* Activity Bars: Hidden on tiny screens, shown on SM+ */}
          <div className="flex gap-2 self-end md:self-center">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`h-3 w-1 rounded-full lg:h-4 ${i < 4 ? "bg-slate-900" : "bg-slate-200"}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
