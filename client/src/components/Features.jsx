import React from "react";
import { motion } from "framer-motion";
import {
  Key,
  FileSearch,
  GitCommit,
  FolderTree,
  Settings2,
  Shield,
  Activity,
  ChevronRight
} from "lucide-react";

const Features = () => {
  const features = [
    {
      id: "SEC_01",
      icon: Key,
      title: "GitHub OAuth 2.0",
      desc: "Limited-scope authentication. We never see your password, only your public AST structure.",
      tag: "SECURITY",
      className: "rounded-tl-2xl"
    },
    {
      id: "AST_02",
      icon: FileSearch,
      title: "Context Synthesis",
      desc: "Goes beyond regex. Understands project hierarchy, exported modules, and internal dependencies.",
      tag: "ENGINE"
    },
    {
      id: "SCAN_03",
      icon: GitCommit,
      title: "Differential Scan",
      desc: "No full repo indexing. We only analyze changed files to keep documentation latency under 1s.",
      tag: "PERFORMANCE",
      className: "rounded-tr-2xl"
    },
    {
      id: "FLOW_04",
      icon: Shield,
      title: "Commit Isolation",
      desc: "Choose direct commits to main or isolated Pull Requests for manual documentation review.",
      tag: "WORKFLOW",
      className: "rounded-bl-2xl"
    },
    {
      id: "ARCH_05",
      icon: FolderTree,
      title: "Monorepo Native",
      desc: "Detects multi-package structures automatically. Maps cross-package dependencies with precision.",
      tag: "SCALING"
    },
    {
      id: "CONF_06",
      icon: Settings2,
      title: "Logic Exclusions",
      desc: "Fine-grained control via .daemondoc ignore. Customize templates to match your studio style.",
      tag: "CONTROL",
      className: "rounded-br-2xl"
    },
  ];

  return (
    <section id="features" className="py-24 sm:py-32 bg-white overflow-hidden border-t border-slate-200">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
        
        {/* Section Header: Brutalist Logic */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-16 gap-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-px w-12 bg-slate-900" />
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                Core_Capabilities // Matrix_01
              </span>
            </motion.div>
            <h2 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
              Everything <br />
              <span className="text-slate-200">The Engine</span> Does.
            </h2>
          </div>
          <div className="hidden lg:block text-right pb-4">
             <Activity size={40} className="text-slate-100 mb-4 ml-auto" />
             <p className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
               [ Protocol: High_Fidelity_Documentation ] <br />
               [ Status: All_Systems_Operational ]
             </p>
          </div>
        </div>

        {/* Features Matrix: Shared Border Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-slate-200 rounded-2xl overflow-hidden">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`group p-8 sm:p-10 border-r border-b border-slate-200 hover:bg-slate-50 transition-colors relative ${feature.className}`}
            >
              {/* Feature ID: Monospaced Metadata */}
              <div className="flex justify-between items-start mb-8">
                <span className="font-mono text-[10px] font-bold text-slate-300 group-hover:text-slate-900 transition-colors">
                  {feature.id}
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-black font-mono text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all uppercase rounded">
                  {feature.tag}
                </span>
              </div>

              {/* Icon & Title */}
              <div className="mb-6">
                <div className="w-12 h-12 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors mb-6">
                  <feature.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                  {feature.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8">
                {feature.desc}
              </p>

              {/* Interactive Corner */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Technical Footer Log */}
        <div className="mt-12 flex flex-col sm:flex-row justify-between items-center py-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-emerald-500" />
             <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
               All features strictly adherent to AST_Spec 2026.1
             </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;