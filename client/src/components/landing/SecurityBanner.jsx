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
      className="overflow-hidden border-y border-slate-200 bg-[#FAFAFA] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10">
        <div className="grid gap-16 lg:grid-cols-[450px_1fr] lg:gap-24">
          {/* Left: Aggressive Security Stance */}
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-8 flex items-center gap-3"
            >
              <div className="h-2 w-2 rounded-full bg-slate-900" />
              <span className="font-mono text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">
                Security_Protocol // Tier_01
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 text-5xl leading-[0.9] font-[1000] tracking-tighter uppercase sm:text-6xl lg:text-7xl"
            >
              Hardened <br />
              <span className="text-slate-300">By Design.</span>
            </motion.h2>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-slate-900">
                <Lock size={18} />
                <span className="font-mono text-xs font-black tracking-widest uppercase">
                  End-to-End Encryption
                </span>
              </div>
              <p className="text-sm leading-relaxed font-medium text-slate-500">
                DaemonDoc treats your source code as a black box. Our AI
                analyzes structure (AST) without ever persisting your logic to
                disk.
              </p>
            </div>
          </div>

          {/* Right: Technical Compliance Grid */}
          <div className="grid gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 shadow-2xl shadow-slate-200/50 sm:grid-cols-2">
            {securityPoints.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white p-8 transition-colors hover:bg-slate-50 sm:p-10"
              >
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-colors group-hover:text-slate-900">
                    {point.icon}
                  </div>
                  <span className="font-mono text-[10px] font-black text-slate-300 transition-colors group-hover:text-slate-900">
                    {point.code}
                  </span>
                </div>

                <h3 className="mb-3 text-lg font-black tracking-tight text-slate-900 uppercase">
                  {point.title}
                </h3>
                <p className="text-sm leading-relaxed font-medium text-slate-500">
                  {point.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 opacity-30 contrast-125 grayscale">
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
          <div className="mx-8 hidden h-px flex-1 bg-slate-200 lg:block" />
          <div className="font-mono text-[10px] font-bold">
            SHA_256: 4f8e...9a21
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurityBanner;
