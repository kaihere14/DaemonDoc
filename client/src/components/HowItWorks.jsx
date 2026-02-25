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
      className="py-20 lg:py-32 bg-white overflow-hidden border-t border-slate-100"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
        {/* Header: Fixed for mobile scaling */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 lg:mb-24 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-4 lg:mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-slate-900" />
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                System_Workflow // v0.4
              </span>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
              The Protocol.
            </h2>
          </div>
          <div className="hidden lg:block text-right pb-2">
            <p className="font-mono text-[10px] font-bold text-slate-300 uppercase leading-relaxed">
              [ Input: Raw Code ] <br />
              [ Processing: LLM + AST Explorer ] <br />[ Output: Structured
              Documentation ]
            </p>
          </div>
        </div>

        {/* The Pipeline Interface */}
        <div className="relative">
          {/* Desktop Connecting Line (Horizontal) */}
          <div className="absolute top-[39px] left-0 w-full h-px bg-slate-100 hidden lg:block" />

          {/* Mobile Connecting Line (Vertical) */}
          <div className="absolute top-0 left-[39px] w-px h-full bg-slate-100 lg:hidden" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-12 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group flex lg:flex-col gap-6 lg:gap-0"
              >
                {/* Visual Node */}
                <div className="flex flex-col items-center lg:items-start lg:mb-8 shrink-0">
                  <div className="relative">
                    <div
                      className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 bg-white
                        ${idx === 2 ? "border-slate-900 shadow-xl lg:shadow-2xl" : "border-slate-100 group-hover:border-slate-300"}
                      `}
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
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white
                        ${idx === 2 ? "bg-blue-500 animate-pulse" : "bg-slate-200"}
                      `}
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
                <div className="space-y-3 lg:space-y-4 pt-2 lg:pt-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] font-black text-slate-300">
                      0{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-50 text-[9px] font-black font-mono text-slate-400 border border-slate-100 uppercase rounded">
                      {step.code}
                    </span>
                  </div>

                  <h3 className="text-lg lg:text-xl font-black uppercase tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-sm text-slate-500 leading-relaxed font-medium lg:max-w-[240px]">
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
          className="mt-16 lg:mt-24 p-6 lg:p-8 border border-slate-100 rounded-3xl lg:rounded-[2rem] bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 lg:gap-6 w-full md:w-auto">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
              <GitPullRequest size={20} className="text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Latest Operation
              </p>
              <p className="text-[11px] lg:text-xs font-mono font-bold text-slate-900 line-clamp-1">
                PR #842: Documentation Update — /src/core/auth.ts
              </p>
            </div>
          </div>

          {/* Activity Bars: Hidden on tiny screens, shown on SM+ */}
          <div className="flex gap-2 self-end md:self-center">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-3 lg:h-4 rounded-full ${i < 4 ? "bg-slate-900" : "bg-slate-200"}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
