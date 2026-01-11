import React from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const PainPoints = () => {
  const painPoints = [
    "Writing READMEs is repetitive and time-consuming",
    "READMEs go out of sync as code evolves",
    "New repositories ship undocumented",
    "Documentation is important, but rarely prioritized",
  ];

  return (
    <section className="py-20 sm:py-28 md:py-32 bg-slate-50/50 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full mb-4">
            <AlertCircle size={16} className="text-slate-600" />
            <span className="text-xs sm:text-sm font-medium text-slate-600">
              The Problem
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4 sm:space-y-6"
        >
          {painPoints.map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="flex items-start gap-3 sm:gap-4 py-4 sm:py-6 border-b border-slate-200 last:border-b-0 group hover:bg-white/50 -mx-4 sm:-mx-6 px-4 sm:px-6 rounded-lg transition-all"
            >
              <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 sm:mt-3 group-hover:bg-slate-600 transition-colors" />
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 font-light leading-relaxed">
                {text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PainPoints;
