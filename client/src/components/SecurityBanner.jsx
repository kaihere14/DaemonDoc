import React from "react";
import { motion } from "framer-motion";
import {
  Github,
  Database,
  ShieldCheck,
  RotateCcw,
  Lock,
  EyeOff,
} from "lucide-react";

const SecurityBanner = () => {
  const securityPoints = [
    {
      code: "AUTH_01",
      icon: <Github size={20} />,
      title: "Official GitHub APIs",
      description:
        "Direct handshake via GitHub OAuth. No custom wrappers or proprietary middle-ware.",
    },
    {
      code: "SCOPE_02",
      icon: <EyeOff size={20} />,
      title: "Least Privilege",
      description:
        "We request Read-Only access to contents. We never touch your private secrets.",
    },
    {
      code: "DATA_03",
      icon: <Database size={20} />,
      title: "Stateless Processing",
      description:
        "Code is analyzed in volatile memory (RAM). Zero storage of your source files.",
    },
    {
      code: "REVOKE_04",
      icon: <RotateCcw size={20} />,
      title: "Immediate Revocation",
      description:
        "Disconnect instantly via GitHub settings. We wipe all metadata associations.",
    },
  ];

  return (
    <section
      id="security"
      className="py-24 sm:py-32 bg-[#FAFAFA] border-y border-slate-200 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
        <div className="grid lg:grid-cols-[450px_1fr] gap-16 lg:gap-24">
          {/* Left: Aggressive Security Stance */}
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-slate-900" />
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                Security_Protocol // Tier_01
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl sm:text-6xl lg:text-7xl font-[1000] tracking-tighter uppercase leading-[0.9] mb-10"
            >
              Hardened <br />
              <span className="text-slate-300">By Design.</span>
            </motion.h2>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <Lock size={18} />
                <span className="text-xs font-black uppercase tracking-widest font-mono">
                  End-to-End Encryption
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                DaemonDoc treats your source code as a black box. Our AI
                analyzes structure (AST) without ever persisting your logic to
                disk.
              </p>
            </div>
          </div>

          {/* Right: Technical Compliance Grid */}
          <div className="grid sm:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
            {securityPoints.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-8 sm:p-10 group hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                    {point.icon}
                  </div>
                  <span className="font-mono text-[10px] font-black text-slate-300 group-hover:text-slate-900 transition-colors">
                    {point.code}
                  </span>
                </div>

                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 mb-3">
                  {point.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {point.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="mt-16 flex flex-wrap justify-between items-center gap-6 opacity-30 grayscale contrast-125">
          <div className="flex items-center gap-8">
            <span className="text-sm font-black tracking-widest uppercase">
              AES-256
            </span>
            <span className="text-sm font-black tracking-widest uppercase">
              TLS 1.3
            </span>
            <span className="text-sm font-black tracking-widest uppercase">
              SOC2 COMPLIANT
            </span>
          </div>
          <div className="h-px flex-1 bg-slate-200 mx-8 hidden lg:block" />
          <div className="font-mono text-[10px] font-bold">
            SHA_256: 4f8e...9a21
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurityBanner;
