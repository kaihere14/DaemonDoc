import React from "react";
import { motion } from "framer-motion";
import { Github, Database, ShieldCheck, RotateCcw } from "lucide-react";

const SecurityBanner = () => {
  const securityPoints = [
    {
      icon: Github,
      title: "Official GitHub APIs",
      description: "Built on GitHub's official OAuth and REST APIs. Nothing custom.",
    },
    {
      icon: ShieldCheck,
      title: "Limited permissions",
      description: "Only requests access to what's necessary. No more, no less.",
    },
    {
      icon: Database,
      title: "Minimal data storage",
      description: "We don't store your code. Only metadata for documentation.",
    },
    {
      icon: RotateCcw,
      title: "Revocable anytime",
      description: "Disconnect from GitHub settings instantly. Full control.",
    },
  ];

  return (
    <section id="security" className="py-20 sm:py-28 md:py-32 px-4 sm:px-6 bg-slate-50/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6">
            Built for trust
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light px-4">
            Security and privacy aren't features. They're requirements.
          </p>
        </motion.div>

        {/* Security Points Grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {securityPoints.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: idx * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex gap-4 sm:gap-6 p-6 sm:p-8 bg-white border border-slate-200 rounded-xl sm:rounded-2xl hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 text-slate-700 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <point.icon size={20} strokeWidth={1.5} className="sm:hidden" />
                  <point.icon size={24} strokeWidth={1.5} className="hidden sm:block" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-slate-900 mb-1 sm:mb-2">
                  {point.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
                  {point.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecurityBanner;
