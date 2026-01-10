import React from "react";
import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="bg-slate-900 text-white p-1.5 rounded-lg">
            <span className="font-bold text-lg leading-none">R</span>
          </div>
          <span className="font-bold text-xl tracking-tight">ReadMeAI</span>
        </motion.div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {["How it works", "Features", "Security"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="hover:text-slate-900 transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/login")}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          <Github size={18} />
          Connect GitHub
        </motion.button>
      </div>
    </nav>
  );
};

export default Navigation;
