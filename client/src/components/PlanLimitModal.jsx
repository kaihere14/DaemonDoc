import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Crown, ChevronRight } from "lucide-react";

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
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.36)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Icon */}
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
                <Crown size={26} className="text-blue-600" />
              </div>

              {/* Label */}
              <p className="mb-1 font-mono text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
                Plan Limit
              </p>

              {/* Copy */}
              <h2 className="mb-2 text-xl font-black tracking-tight text-slate-900 uppercase">
                Repo limit reached
              </h2>
              <p className="mb-7 text-sm leading-relaxed text-slate-500">
                Your{" "}
                <span className="font-semibold text-slate-700">free plan</span>{" "}
                supports up to{" "}
                <span className="font-semibold text-slate-700">
                  {limit} active {limit === 1 ? "repo" : "repos"}
                </span>
                . Upgrade to{" "}
                <span className="font-semibold text-slate-700">Pro</span> to
                activate unlimited repositories and unlock all features.
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    onClose();
                    navigate("/upgrade");
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-[1.1rem] bg-[#1d4ed8] px-5 py-3 text-sm font-bold tracking-[0.14em] text-white uppercase shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1e40af]"
                >
                  Upgrade to Pro
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={onClose}
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

export default PlanLimitModal;
