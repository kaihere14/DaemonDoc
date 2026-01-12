import React from "react";
import { motion } from "framer-motion";
import {
  Github,
  Terminal,
  ChevronRight,
  Code2,
  Cpu,
  FileText,
  GitBranch,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen bg-white text-black selection:bg-black selection:text-white font-sans pt-24" id="hero">
      {/* The Background: Architectural Grid with Coordinates */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 100H0V0h100v100zM50 0v100M0 50h100' fill='none' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-[1400px] mx-auto px-10 relative z-10">
        {/* HEADER: System Metadata (Density Fix) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black/10 pb-8 mb-12 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-black animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em]">
                DaemonDoc_Sys_Link
              </span>
            </div>
            <h2 className="text-sm font-mono text-slate-400 italic">
              Project: Auto-Documentation for Arman Thakur
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-8 font-mono text-[10px] uppercase font-bold tracking-tighter">
            <div>
              <p className="text-slate-400 mb-1">Engine</p>
              <p>v0.4.2_AST</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Latency</p>
              <p>842ms</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Uptime</p>
              <p>99.98%</p>
            </div>
          </div>
        </div>

        {/* HERO CONTENT: Brutalist Typography */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-20 mb-24">
          <div className="max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[clamp(3.5rem,10vw,9rem)] leading-[0.82] font-[1000] tracking-[-0.06em] uppercase mb-12"
            >
              Ship logic. <br />
              <span className="text-slate-200">Docs follow.</span>
            </motion.h1>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-black text-white px-8 py-5 rounded-xl font-black text-xs uppercase flex items-center gap-4 hover:bg-slate-800 transition-all border border-black group"
              >
                <Github size={18} />
                <span>Initialize Git Hook</span>
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
              <div className="px-8 py-5 border rounded-xl border-black/20 font-mono text-xs font-bold flex items-center gap-3 bg-slate-50">
                <Terminal size={18} className="text-slate-400" />
                <span>ssh root@void.null -p 404</span>
              </div>
            </div>
          </div>

          {/* THE VISUAL: The "Vertical Pipeline" (Real Engineering) */}
          <div className="relative border-l border-black/10 pl-12 py-4 hidden lg:block">
            <div className="space-y-16 relative">
              {/* Step 1: Code Input */}
              <PipelineStep
                icon={<Code2 size={20} />}
                title="Source Extraction"
                active
              >
                <div className="font-mono text-[11px] text-slate-500 space-y-1 mt-4">
                  <p>&gt; Scanning ./src/dns-server.ts</p>
                  <p>&gt; Extracting AST nodes (Function: resolveQuery)</p>
                </div>
              </PipelineStep>

              {/* Step 2: AI Comprehension */}
              <PipelineStep icon={<Cpu size={20} />} title="Logic Synthesis">
                <div className="mt-4 flex gap-2">
                  <div className="px-2 py-1 bg-black text-white text-[9px] font-black uppercase">
                    Redis_Cache
                  </div>
                  <div className="px-2 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase">
                    Recursive_DNS
                  </div>
                </div>
              </PipelineStep>

              {/* Step 3: Markdown Generation */}
              <PipelineStep icon={<FileText size={20} />} title="README Sync">
                <div className="mt-4 border-t border-black/10 pt-4">
                  <div className="h-2 w-full bg-slate-100 mb-2" />
                  <div className="h-2 w-2/3 bg-slate-100" />
                </div>
              </PipelineStep>

              {/* Connecting Line */}
              <div className="absolute top-0 left-[-49px] bottom-0 w-[1px] bg-black/10 z-0" />
            </div>
          </div>
        </div>

        {/* FOOTER: Feature Blueprint */}
        <div className="grid md:grid-cols-3 gap-px bg-black/10 border border-black/10 rounded-2xl">
          <FeatureCard
            title="Recursive AST Analysis"
            desc="We don't use regex. We parse your actual code structure to understand dependencies."
            icon={<GitBranch size={20} />}
            className="rounded-tl-2xl rounded-bl-2xl"
          />
          <FeatureCard
            title="Redis-Backed Context"
            desc="Instant documentation updates powered by high-speed state management."
            icon={<Share2 size={20} />}
          />
          <FeatureCard
            title="Zero-Configuration"
            desc="Drops into your pre-commit hooks. No dashboard needed. Just engineering."
            icon={<Terminal size={20} />}
            className="rounded-tr-2xl rounded-br-2xl"
          />
        </div>
      </div>
    </section>
  );
};

// Internal Components for Precision
const PipelineStep = ({ icon, title, children, active }) => (
  <div className="relative z-10">
    <div
      className={`absolute left-[-60px] top-0 w-6 h-6 rounded-full border border-black flex items-center justify-center bg-white ${
        active ? "border-black" : "border-slate-200"
      }`}
    >
      {React.cloneElement(icon, {
        size: 12,
        className: active ? "text-black" : "text-slate-300",
      })}
    </div>
    <h3 className="text-xs font-black uppercase tracking-widest">{title}</h3>
    {children}
  </div>
);

const FeatureCard = ({ title, desc, icon, className }) => (
  <div className={`bg-white p-10 hover:bg-slate-50 transition-colors ${className}`}>
    <div className="mb-6">{icon}</div>
    <h4 className="text-sm font-black uppercase tracking-tight mb-4">
      {title}
    </h4>
    <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
  </div>
);

export default Hero;
