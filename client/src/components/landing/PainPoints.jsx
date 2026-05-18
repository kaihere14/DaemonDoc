import React from "react";
import { motion } from "framer-motion";
import { XCircle, Terminal, AlertTriangle, ZapOff, Clock } from "lucide-react";

const PainPoints = () => {
  const points = [
    {
      title: "Boilerplate Burnout",
      desc: "Manually writing the same structure for every repo is a waste of engineering talent.",
      icon: <Terminal size={18} />,
    },
    {
      title: "Doc-to-Code Drift",
      desc: "Your logic evolved 3 weeks ago; your README is still living in the past.",
      icon: <ZapOff size={18} />,
    },
    {
      title: "Documentation Debt",
      desc: "New microservices ship undocumented because 'we'll do it later' never happens.",
      icon: <Clock size={18} />,
    },
  ];

  return (
    <section
      id="pain-points"
      className="overflow-hidden border-y border-slate-100 bg-white py-16 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-12">
        {/* Responsive Grid: Stacked on mobile, 2-col on LG screens */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_500px] lg:gap-20">
          {/* LEFT: Aggressive Problem Statement */}
          {/* We remove 'sticky' for mobile and re-enable it for LG */}
          <div className="space-y-6 lg:sticky lg:top-32 lg:space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <div className="h-px w-8 bg-red-500 sm:w-12" />
              <span className="font-mono text-[10px] font-black tracking-[0.3em] text-red-500 uppercase">
                The Friction Cost
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              /* Adjusted clamp for better mobile scaling */
              className="text-[clamp(2rem,8vw,5.5rem)] leading-[0.95] font-black tracking-tighter uppercase lg:leading-[0.9]"
            >
              SHIP CODE. <br />
              <span className="text-slate-200">NOT TECHNICAL</span> <br />
              DEBT.
            </motion.h2>

            <p className="max-w-md text-lg leading-relaxed font-medium text-slate-500 sm:text-xl">
              Every minute spent on boilerplate documentation is a minute stolen
              from building features that actually matter.
            </p>
          </div>

          {/* RIGHT: High-Density Friction Grid */}
          <div className="w-full space-y-4">
            {points.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border border-slate-200 bg-slate-50/30 p-6 transition-all duration-500 hover:border-slate-900 hover:bg-white sm:rounded-3xl sm:p-8"
              >
                <div className="mb-4 flex items-start justify-between sm:mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors group-hover:border-red-100 group-hover:text-red-500">
                    {point.icon}
                  </div>
                  <XCircle
                    size={16}
                    className="text-slate-200 transition-colors group-hover:text-red-200"
                  />
                </div>

                <h3 className="mb-2 text-base font-black tracking-tight text-slate-900 uppercase sm:text-lg">
                  {point.title}
                </h3>
                <p className="text-sm leading-relaxed font-medium text-slate-500">
                  {point.desc}
                </p>
              </motion.div>
            ))}

            {/* Total Impact Card - Re-proportioned for mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-slate-900 p-6 text-white sm:rounded-[2.5rem] sm:p-8"
            >
              <div>
                <p className="mb-1 text-[9px] font-black tracking-widest text-slate-500 uppercase sm:text-[10px]">
                  Estimated Friction
                </p>
                <p className="font-mono text-2xl font-black tracking-tighter sm:text-3xl">
                  4.2 Hrs/Week
                </p>
              </div>
              <AlertTriangle size={28} className="shrink-0 text-amber-500" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PainPoints;
