import React from "react";
import { motion } from "framer-motion";
import { Github, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FinalCTA = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-20 sm:py-28 md:py-32 px-4 sm:px-6 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full mb-6 sm:mb-8"
        >
          <Sparkles size={16} className="text-slate-700" />
          <span className="text-xs sm:text-sm font-medium text-slate-700">
            Free to Get Started
          </span>
        </motion.div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 sm:mb-8 leading-tight px-4">
          Ready to automate
          <br />
          your documentation?
        </h2>
        
        <motion.button
          onClick={() => navigate("/login")}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-slate-900 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-semibold text-base sm:text-lg flex items-center gap-2 sm:gap-3 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl mx-auto group w-full sm:w-auto justify-center max-w-sm sm:max-w-none"
        >
          <Github size={20} className="sm:hidden" />
          <Github size={22} className="hidden sm:block" />
          <span>Get Started for Free</span>
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform sm:hidden"
          />
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform hidden sm:block"
          />
        </motion.button>

        <p className="text-xs sm:text-sm text-slate-500 mt-4 sm:mt-6 font-light">
          No credit card required • Connect in seconds
        </p>
      </motion.div>
    </section>
  );
};

export default FinalCTA;
