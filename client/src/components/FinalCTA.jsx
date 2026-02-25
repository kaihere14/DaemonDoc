import React from "react";
import { motion } from "framer-motion";
import {
  Github,
  ArrowRight,
  Activity,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 sm:py-32 bg-white px-6">
      <div className="max-w-[1440px] mx-auto">
        {/* The Execution Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-white border-2 border-slate-900 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)]"
        >
          {/* Top Status Bar: High-Density Detail */}
          <div className="flex items-center justify-between px-6 sm:px-10 py-4 bg-slate-900 text-white">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <span className="hidden sm:block font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-50">
                System.Execution_Mode
              </span>
            </div>
            <div className="flex items-center gap-6 font-mono text-[10px] font-black uppercase tracking-widest">
              <span className="hidden md:flex items-center gap-2">
                <Activity size={12} className="text-emerald-500" />
                Engine_Idle
              </span>
              <span className="text-slate-500">v0.4.2_Stable</span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-8 sm:p-16 lg:p-24 text-center relative overflow-hidden">
            {/* Subtle Background Mark */}
            <Terminal
              size={400}
              className="absolute -bottom-20 -right-20 text-slate-50 opacity-50 -rotate-12 pointer-events-none"
              strokeWidth={1}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10 flex flex-col items-center"
            >
              <h2 className="text-[clamp(2.5rem,7vw,5.5rem)] font-[1000] tracking-tighter leading-[0.9] text-slate-900 mb-10 uppercase">
                Stop Writing. <br />
                <span className="text-slate-300">Start Shipping.</span>
              </h2>

              <div className="flex flex-col items-center gap-8 w-full">
                <motion.button
                  onClick={() => navigate("/login")}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative bg-slate-900 text-white px-10 py-6 rounded-2xl font-black text-lg uppercase flex items-center gap-4 transition-all shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(15,23,42,0.4)] w-full sm:w-auto justify-center"
                >
                  <Github size={24} />
                  <span>Initialize Engine</span>
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </motion.button>

                {/* Technical Trust Footer */}
                <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 opacity-40">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest font-mono text-slate-900">
                      Zero_Creds_Stored
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-900" />
                    <span className="text-[10px] font-black uppercase tracking-widest font-mono text-slate-900">
                      OAuth_Standard
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-900" />
                    <span className="text-[10px] font-black uppercase tracking-widest font-mono text-slate-900">
                      Unlimited_Repos
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* System Breadcrumb Footer */}
        <div className="mt-12 flex justify-between items-center px-4 opacity-20 font-mono text-[9px] font-black uppercase tracking-[0.4em]">
          <span>Root // Landing // Final_Call</span>
          <span className="hidden sm:block">Thread_ID: 0x842_DOCS</span>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
