import React from "react";
import { motion } from "framer-motion";

const AdminHero = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.32)] backdrop-blur-sm sm:rounded-[2.5rem] sm:p-8">
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-1 w-8 rounded-full bg-blue-600" />
              <span className="font-mono text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                Admin System
              </span>
            </div>
            <h1 className="mb-3 text-3xl leading-none font-black tracking-tighter text-slate-900 uppercase sm:text-5xl">
              Control Center
            </h1>
            <p className="max-w-2xl text-sm font-medium tracking-tight text-slate-500 sm:text-base">
              Review platform health first, then launch audience updates from a
              dedicated broadcast workspace.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminHero;
