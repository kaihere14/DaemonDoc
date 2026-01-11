import React from "react";
import { motion } from "framer-motion";
import {
  Key,
  FileSearch,
  GitCommit,
  FolderTree,
  Settings2,
  Shield,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Key,
      title: "Secure GitHub OAuth",
      desc: "Official GitHub authentication. Limited permissions. Revocable anytime.",
    },
    {
      icon: FileSearch,
      title: "Context-aware code analysis",
      desc: "Understands your project structure and dependencies intelligently.",
    },
    {
      icon: GitCommit,
      title: "Smart file scanning",
      desc: "No full repo indexing. Only analyzes what matters for documentation.",
    },
    {
      icon: Shield,
      title: "Safe commits or PRs",
      desc: "Choose between direct commits or pull request-based updates.",
    },
    {
      icon: FolderTree,
      title: "Monorepo support",
      desc: "Handles complex multi-package structures without breaking a sweat.",
    },
    {
      icon: Settings2,
      title: "Configurable exclusions",
      desc: "Exclude files, customize templates, control what gets documented.",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 md:py-32 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6">
            Everything you need
          </h2>
          <div className="w-12 sm:w-16 h-1 bg-slate-900 mx-auto rounded-full" />
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -4 }}
              className="group p-6 sm:p-8 bg-white border border-slate-200 rounded-xl sm:rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900 text-white rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-sm"
              >
                <feature.icon size={20} strokeWidth={1.5} className="sm:hidden" />
                <feature.icon size={24} strokeWidth={1.5} className="hidden sm:block" />
              </motion.div>
              <h3 className="font-semibold text-lg sm:text-xl text-slate-900 mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
