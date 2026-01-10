import React from "react";
import { motion } from "framer-motion";
import {
  Github,
  ArrowRight,
  FileText,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="pt-40 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-xs font-medium text-emerald-700 mb-8"
        >
          <Sparkles size={14} /> Automate your documentation
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6"
        >
          Your README,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-600 to-slate-400">
            on Autopilot.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Stop wasting hours on boilerplate. We analyze your commits and
          codebase to keep your documentation as fresh as your code.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all hover:shadow-xl group"
          >
            <Github size={20} />
            Connect GitHub
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </motion.div>

        {/* Visual Flow with Animated Paths */}
        <div className="flex items-center justify-center gap-4 md:gap-12">
          {[
            { icon: <Github />, label: "Your Repo" },
            {
              icon: <RefreshCw className="animate-spin-slow" />,
              label: "AI Analysis",
              primary: true,
            },
            {
              icon: <FileText className="text-emerald-500" />,
              label: "README.md",
              success: true,
            },
          ].map((item, idx, arr) => (
            <React.Fragment key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className={`w-16 h-16 rounded-2xl border flex items-center justify-center shadow-sm ${
                    item.primary
                      ? "bg-slate-900 text-white"
                      : item.success
                      ? "border-emerald-200 bg-emerald-50"
                      : "bg-white border-slate-200"
                  }`}
                >
                  {item.icon}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    item.success ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
              {idx < arr.length - 1 && (
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "auto" }}
                  viewport={{ once: true }}
                  className="text-slate-200 hidden md:block"
                >
                  <ArrowRight size={24} />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
