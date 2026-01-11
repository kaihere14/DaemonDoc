import React from "react";
import { motion } from "framer-motion";
import { Github, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-10 sm:py-12 px-4 sm:px-6 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 text-white p-2 rounded-lg">
              <span className="font-bold text-base sm:text-lg leading-none">D</span>
            </div>
            <span className="font-semibold text-lg sm:text-xl tracking-tight text-slate-900">
              DaemonDoc
            </span>
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
            <span>© {currentYear} DaemonDoc. Built with</span>
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>for developers</span>
          </div>

          {/* GitHub Link */}
          <motion.a
            href="https://github.com/kaihere14/daemondoc"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Github size={16} className="sm:hidden" />
            <Github size={18} className="hidden sm:block" />
            <span className="font-medium">View on GitHub</span>
          </motion.a>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

