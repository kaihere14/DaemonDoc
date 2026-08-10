"use client";

import { motion, useReducedMotion } from "framer-motion";

interface PageEntranceProps {
  children: React.ReactNode;
}

export default function PageEntrance({ children }: PageEntranceProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="min-h-screen overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-indigo-100"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0.2 : 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
