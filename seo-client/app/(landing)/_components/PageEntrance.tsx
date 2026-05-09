"use client";

import { motion } from "framer-motion";

interface PageEntranceProps {
  children: React.ReactNode;
}

export default function PageEntrance({ children }: PageEntranceProps) {
  return (
    <motion.div
      className="min-h-screen overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-indigo-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
