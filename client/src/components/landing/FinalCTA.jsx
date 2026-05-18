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
    <section className="bg-white px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px]">
        {/* The Execution Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] border-2 border-slate-900 bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] sm:rounded-[3rem]"
        >
          {/* Top Status Bar: High-Density Detail */}
          <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white sm:px-10">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <span className="hidden font-mono text-[10px] font-black tracking-[0.3em] uppercase opacity-50 sm:block">
                System.Execution_Mode
              </span>
            </div>
            <div className="flex items-center gap-6 font-mono text-[10px] font-black tracking-widest uppercase">
              <span className="hidden items-center gap-2 md:flex">
                <Activity size={12} className="text-emerald-500" />
                Engine_Idle
              </span>
              <span className="text-slate-500">v0.4.2_Stable</span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="relative overflow-hidden p-8 text-center sm:p-16 lg:p-24">
            {/* Subtle Background Mark */}
            <Terminal
              size={400}
              className="pointer-events-none absolute -right-20 -bottom-20 -rotate-12 text-slate-50 opacity-50"
              strokeWidth={1}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10 flex flex-col items-center"
            >
              <h2 className="mb-10 text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.9] font-[1000] tracking-tighter text-slate-900 uppercase">
                Stop Writing. <br />
                <span className="text-slate-300">Start Shipping.</span>
              </h2>

              <div className="flex w-full flex-col items-center gap-8">
                <motion.button
                  onClick={() => navigate("/login")}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative flex w-full items-center justify-center gap-4 rounded-2xl bg-slate-900 px-10 py-6 text-lg font-black text-white uppercase shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] transition-all hover:shadow-[0_25px_50px_-12px_rgba(15,23,42,0.4)] sm:w-auto"
                >
                  <Github size={24} />
                  <span>Initialize Engine</span>
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </motion.button>

                {/* Technical Trust Footer */}
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-40">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} />
                    <span className="font-mono text-[10px] font-black tracking-widest text-slate-900 uppercase">
                      Zero_Creds_Stored
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-slate-900" />
                    <span className="font-mono text-[10px] font-black tracking-widest text-slate-900 uppercase">
                      OAuth_Standard
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-slate-900" />
                    <span className="font-mono text-[10px] font-black tracking-widest text-slate-900 uppercase">
                      Unlimited_Repos
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* System Breadcrumb Footer */}
        <div className="mt-12 flex items-center justify-between px-4 font-mono text-[9px] font-black tracking-[0.4em] uppercase opacity-20">
          <span>Root // Landing // Final_Call</span>
          <span className="hidden sm:block">Thread_ID: 0x842_DOCS</span>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
