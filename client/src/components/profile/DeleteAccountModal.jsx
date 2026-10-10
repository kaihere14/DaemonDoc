import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThinkingOrb } from "@/components/ui/thinking-orb";
import { DokuFigure } from "@/components/doku/Doku";

const CONFIRM_WORD = "delete";

/**
 * Asks the user to type "delete" before their account goes. The parent owns
 * the typed text and the request, so it can reset both when the modal closes.
 */
const DeleteAccountModal = ({
  open,
  confirmText,
  onConfirmTextChange,
  deleting,
  onClose,
  onConfirm,
}) => {
  const confirmed = confirmText.toLowerCase() === CONFIRM_WORD;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="rounded-panel-lg shadow-overlay w-full max-w-md border border-slate-200 bg-white p-8 text-center sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 text-center">
              <div className="mb-4 flex justify-center">
                <DokuFigure pose="oops" className="w-20" />
              </div>
              <h3
                id="delete-account-title"
                className="mb-2 text-xl font-black tracking-tight text-slate-900 uppercase"
              >
                Delete Account
              </h3>
              <p className="text-sm text-slate-500">
                This action cannot be undone. All your data will be permanently
                deleted.
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="delete-confirm"
                className="mb-2 block text-left font-mono text-[10px] font-black tracking-[0.22em] text-slate-400 uppercase"
              >
                Type <span className="text-rose-600">delete</span> to confirm
              </label>
              <input
                id="delete-confirm"
                type="text"
                value={confirmText}
                onChange={(e) => onConfirmTextChange(e.target.value)}
                placeholder="Type 'delete' here"
                className="rounded-control w-full border border-slate-200 px-4 py-3 text-slate-900 transition-colors focus:border-rose-500 focus:ring-2 focus:ring-rose-500/40 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="rounded-control flex-1 cursor-pointer bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={!confirmed || deleting}
                className={`rounded-control flex flex-1 items-center justify-center gap-2 px-4 py-3 font-semibold transition-colors ${
                  confirmed && !deleting
                    ? "cursor-pointer bg-rose-600 text-white hover:bg-rose-700"
                    : "cursor-not-allowed bg-rose-200 text-rose-400"
                }`}
              >
                {deleting ? (
                  <>
                    <ThinkingOrb
                      preset="working"
                      showLabel={false}
                      tone="ghost"
                      size="sm"
                      className="h-auto p-0 text-current [--orb-size:1.25rem]"
                    />
                    <span>Deleting...</span>
                  </>
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteAccountModal;
