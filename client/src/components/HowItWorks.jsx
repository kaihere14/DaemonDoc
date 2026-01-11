import React from "react";
import { motion } from "framer-motion";
import { Github, Play, FileCode, CheckCircle2 } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: Github,
      title: "Connect GitHub",
      description: "Authenticate with GitHub OAuth. Simple, secure, standard.",
    },
    {
      number: "02",
      icon: Play,
      title: "Enable repositories",
      description: "Choose which repos get automatic documentation updates.",
    },
    {
      number: "03",
      icon: FileCode,
      title: "Push code as usual",
      description: "No changes to your workflow. Just code like you always do.",
    },
    {
      number: "04",
      icon: CheckCircle2,
      title: "README updates automatically",
      description: "Fresh documentation committed back to your repository.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 md:py-32 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6">
            How it works
          </h2>
          <div className="w-12 sm:w-16 h-1 bg-slate-900 mx-auto rounded-full" />
        </motion.div>

        {/* Steps */}
        <div className="space-y-10 sm:space-y-12 md:space-y-16">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: idx * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 group"
            >
              {/* Step Number & Icon */}
              <div className="flex items-center gap-4 sm:gap-6 sm:w-1/3">
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-200 group-hover:text-slate-300 transition-colors">
                    {step.number}
                  </span>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <step.icon size={24} strokeWidth={1.5} className="sm:hidden" />
                    <step.icon size={28} strokeWidth={1.5} className="hidden sm:block" />
                  </motion.div>
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 sm:pt-4">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 mb-2 sm:mb-3">
                  {step.title}
                </h3>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-light">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

