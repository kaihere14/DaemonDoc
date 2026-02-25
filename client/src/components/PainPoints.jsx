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
      className="py-16 sm:py-24 lg:py-32 bg-white border-y border-slate-100 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12">
        {/* Responsive Grid: Stacked on mobile, 2-col on LG screens */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-12 lg:gap-20 items-start">
          {/* LEFT: Aggressive Problem Statement */}
          {/* We remove 'sticky' for mobile and re-enable it for LG */}
          <div className="lg:sticky lg:top-32 space-y-6 lg:space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <div className="h-px w-8 sm:w-12 bg-red-500" />
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
                The Friction Cost
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              /* Adjusted clamp for better mobile scaling */
              className="text-[clamp(2rem,8vw,5.5rem)] font-black tracking-tighter leading-[0.95] lg:leading-[0.9] uppercase"
            >
              SHIP CODE. <br />
              <span className="text-slate-200">NOT TECHNICAL</span> <br />
              DEBT.
            </motion.h2>

            <p className="text-lg sm:text-xl text-slate-500 max-w-md font-medium leading-relaxed">
              Every minute spent on boilerplate documentation is a minute stolen
              from building features that actually matter.
            </p>
          </div>

          {/* RIGHT: High-Density Friction Grid */}
          <div className="space-y-4 w-full">
            {points.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 sm:p-8 border border-slate-200 rounded-2xl sm:rounded-3xl hover:border-slate-900 transition-all duration-500 bg-slate-50/30 hover:bg-white"
              >
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-red-500 group-hover:border-red-100 transition-colors shadow-sm">
                    {point.icon}
                  </div>
                  <XCircle
                    size={16}
                    className="text-slate-200 group-hover:text-red-200 transition-colors"
                  />
                </div>

                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 mb-2">
                  {point.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {point.desc}
                </p>
              </motion.div>
            ))}

            {/* Total Impact Card - Re-proportioned for mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-6 sm:p-8 bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] text-white flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                  Estimated Friction
                </p>
                <p className="text-2xl sm:text-3xl font-black font-mono tracking-tighter">
                  4.2 Hrs/Week
                </p>
              </div>
              <AlertTriangle size={28} className="text-amber-500 shrink-0" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PainPoints;
