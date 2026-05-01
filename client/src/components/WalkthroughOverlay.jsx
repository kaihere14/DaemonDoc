import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, CheckCircle2, ChevronRight, Info, Zap } from "lucide-react";

// Step 0: non-blocking guide banner shown above the repo grid on /home
export const WalkthroughBanner = ({ onSkip }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative mx-auto mb-6 flex max-w-7xl items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/90 px-5 py-4 shadow-sm backdrop-blur-sm"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow shadow-blue-500/30">
        <Zap size={15} strokeWidth={2.5} />
      </div>
      <div className="flex-1 text-sm text-blue-900">
        <span className="font-black">Welcome to DaemonDoc!</span> Enable a
        repository below to start AI-powered README automation.{" "}
        <span className="font-semibold">
          Toggle the switch on any repo card
        </span>{" "}
        to begin.
      </div>
      <button
        onClick={onSkip}
        aria-label="Skip walkthrough"
        className="shrink-0 rounded-lg p-1 text-blue-400 transition-colors hover:bg-blue-100 hover:text-blue-600"
      >
        <X size={16} />
      </button>
    </motion.div>
  </AnimatePresence>
);

// Step 1: modal shown after the first repo is successfully enabled
export const WalkthroughModal = ({ open, onGoToLogs, onSkip }) => {
  const navigate = useNavigate();

  const handleGoToLogs = () => {
    onGoToLogs();
    navigate("/logs");
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="wt-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onSkip}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            key="wt-modal"
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onSkip}
          >
            <div
              className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.36)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onSkip}
                className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
                <CheckCircle2 size={28} className="text-blue-600" />
              </div>

              <p className="mb-1 font-mono text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
                Repo Enabled
              </p>
              <h2 className="mb-3 text-xl font-black tracking-tight text-slate-900 uppercase">
                Your first README is being generated!
              </h2>
              <p className="mb-7 text-sm leading-relaxed text-slate-500">
                DaemonDoc is now processing your repository.{" "}
                <span className="font-semibold text-slate-700">
                  Head to Activity Logs
                </span>{" "}
                to watch every step in real time. Future commits to this repo
                will also be logged there automatically.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleGoToLogs}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-[1.1rem] bg-[#1d4ed8] px-5 py-3 text-sm font-bold tracking-[0.14em] text-white uppercase shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1e40af]"
                >
                  Go to Logs
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={onSkip}
                  className="flex-1 rounded-[1.1rem] border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

// Step 2: info banner shown at the top of /logs
export const WalkthroughLogsBanner = ({ onDismiss }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mb-8 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50/90 px-5 py-4 shadow-sm backdrop-blur-sm"
    >
      <Info size={18} className="mt-0.5 shrink-0 text-sky-500" />
      <div className="flex-1 text-sm text-sky-900">
        <span className="font-black">After enabling a repo</span>, DaemonDoc
        automatically generates its first README — watch each step appear below
        in real time. <span className="font-semibold">Every future commit</span>{" "}
        to your enabled repos will also be logged here.
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-lg p-1 text-sky-400 transition-colors hover:bg-sky-100 hover:text-sky-600"
      >
        <X size={16} />
      </button>
    </motion.div>
  </AnimatePresence>
);
