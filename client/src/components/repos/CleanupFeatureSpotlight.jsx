import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import RepoCard from "./RepoCard";

const PREVIEW_REPO = {
  id: "cleanup-intro-preview",
  name: "your-repo",
  full_name: "you/your-repo",
  owner: "you",
  default_branch: "main",
  private: false,
  activated: true,
  canActivate: true,
};

const CleanupButtonCallout = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    }}
    whileInView={{
      y: [0, 3, 0],
      transition: {
        duration: 1,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
      },
    }}
    viewport={{ once: true }}
    className="pointer-events-none absolute right-[18px] bottom-15 z-10 flex flex-col items-center sm:right-[17px] sm:bottom-[3.79rem]"
    aria-hidden
  >
    <p className="mb-1 text-[10px] font-bold whitespace-nowrap text-blue-700">
      Cleanup
    </p>
    <div className="h-0 w-0 border-x-10 border-t-12 border-x-transparent border-t-[#1d4ed8]" />
  </motion.div>
);

const CleanupFeatureSpotlight = ({ open, onDismiss }) =>
  createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cleanup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onDismiss}
            className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-sm"
            aria-hidden
          />

          <motion.div
            key="cleanup-card"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-[63] flex items-center justify-center p-4"
            onClick={onDismiss}
          >
            <motion.div
              className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.36)] sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={onDismiss}
                className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <span className="mb-3 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 font-mono text-[10px] font-black tracking-[0.2em] text-blue-700 uppercase">
                New
              </span>

              <h2 className="mb-2 pr-8 text-xl font-black tracking-tight text-slate-900 uppercase sm:text-2xl">
                Clean up bloated READMEs
              </h2>

              <p className="mb-5 text-sm leading-relaxed text-slate-500">
                Tap the brush icon on any repo card. DaemonDoc uses AI to
                restructure cluttered READMEs — merge duplicate sections, trim
                noise, and keep what matters — then commits to your default
                branch with{" "}
                <span className="font-mono text-xs text-slate-600">
                  [skip ci]
                </span>
                .
              </p>

              <p className="mb-3 font-mono text-[10px] font-black tracking-[0.24em] text-slate-400 uppercase">
                Preview
              </p>

              <div className="relative">
                <CleanupButtonCallout />
                <RepoCard
                  repo={PREVIEW_REPO}
                  showToggle
                  isPreview
                  highlightCleanupButton
                />
              </div>

              <p className="mt-4 text-center text-xs font-semibold text-slate-500">
                Find this button on every repo card on your dashboard
              </p>

              <motion.div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onDismiss}
                  className="inline-flex flex-1 items-center justify-center rounded-[1.1rem] bg-[#1d4ed8] px-5 py-3 text-sm font-bold tracking-[0.12em] text-white uppercase shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1e40af]"
                >
                  Got it
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="flex-1 rounded-[1.1rem] border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100"
                >
                  Maybe later
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );

export default CleanupFeatureSpotlight;
