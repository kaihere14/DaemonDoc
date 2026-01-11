import React from "react";
import { motion } from "framer-motion";
import {
  Github,
  ArrowRight,
  FileText,
  Cpu,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="pt-32 sm:pt-40 md:pt-48 pb-20 sm:pb-28 md:pb-32 px-4 sm:px-6 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-6 sm:mb-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full mb-6 sm:mb-8"
          >
            <Sparkles size={16} className="text-slate-700" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              AI-Powered Documentation
            </span>
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-slate-900 mb-6 sm:mb-8 leading-[1.1] px-4">
            Your README,
            <br />
            <span className="text-slate-900 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text">
              on Autopilot.
            </span>
          </h1>
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed text-center font-light px-4"
        >
          Stop wasting hours on boilerplate. ReadIt analyzes your code and commits to keep documentation as fresh as your codebase.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-16 sm:mb-20 md:mb-24 px-4"
        >
          <motion.button
            onClick={() => navigate("/login")}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg flex items-center gap-2 sm:gap-3 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl group w-full sm:w-auto justify-center"
          >
            <Github size={20} className="sm:hidden" />
            <Github size={22} className="hidden sm:block" />
            <span>Connect GitHub</span>
            <motion.div
              className="overflow-hidden hidden sm:block"
              initial={{ width: 0 }}
              whileHover={{ width: "auto" }}
            >
              <ArrowRight
                size={20}
                className="group-hover:translate-x-0 -translate-x-1 transition-transform"
              />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Visual Flow - Minimal and clean */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-16 px-4"
        >
          {[
            { icon: Github, label: "Repository", color: "slate" },
            { icon: Cpu, label: "Analysis", color: "slate", primary: true },
            { icon: FileText, label: "README.md", color: "slate" },
          ].map((item, idx, arr) => (
            <React.Fragment key={idx}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.5 + idx * 0.15,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4"
              >
                <motion.div
                  whileHover={{ y: -4, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center transition-all ${
                    item.primary
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <item.icon size={24} strokeWidth={1.5} className="sm:hidden" />
                  <item.icon size={28} strokeWidth={1.5} className="hidden sm:block md:hidden" />
                  <item.icon size={32} strokeWidth={1.5} className="hidden md:block" />
                </motion.div>
                <span className="text-xs sm:text-sm font-medium text-slate-500 tracking-wide text-center">
                  {item.label}
                </span>
              </motion.div>
              {idx < arr.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.7 + idx * 0.15,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="hidden sm:block"
                  style={{ originX: 0 }}
                >
                  <div className="w-8 md:w-12 h-[2px] bg-slate-200" />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
