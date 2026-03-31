import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Zap, Lock } from "lucide-react";

/**
 * Shown when the user hits a plan-based limit (e.g. active repo cap).
 * Props:
 *   open       — boolean
 *   onClose    — () => void
 *   limit      — number  (the cap they hit)
 */
const PlanLimitModal = ({ open, onClose, limit = 5 }) => {
  const navigate = useNavigate();

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Icon */}
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100">
                <Lock size={26} className="text-amber-500" />
              </div>

              {/* Copy */}
              <h2 className="mb-2 text-xl font-black uppercase tracking-tight text-slate-900">
                Repo limit reached
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-slate-500">
                Your <span className="font-semibold text-slate-700">free plan</span> supports up to{" "}
                <span className="font-semibold text-slate-700">{limit} active {limit === 1 ? "repo" : "repos"}</span>.
                Upgrade to <span className="font-semibold text-slate-700">Pro</span> to activate unlimited repositories and unlock all features.
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    onClose();
                    navigate("/upgrade");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 active:scale-95"
                >
                  <Zap size={16} />
                  Upgrade to Pro
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PlanLimitModal;
