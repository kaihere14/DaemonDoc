import React from "react";
import { Send, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDialog } from "../../hooks/useDialog";
import { ThinkingOrb } from "@/components/ui/thinking-orb";

const ConfirmBroadcastModal = ({
  isOpen,
  subject,
  selectedRecipientIds,
  selectedRecipientPreview,
  isLoading,
  onConfirm,
  onClose,
}) => {
  useDialog(isOpen, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-broadcast-title"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-panel-lg shadow-overlay w-full max-w-md border border-slate-200 bg-white p-8 text-center sm:p-10"
          >
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
              <Check size={40} strokeWidth={2.5} />
            </div>

            <h2
              id="confirm-broadcast-title"
              className="mb-4 text-3xl font-black tracking-tight text-slate-900 uppercase"
            >
              Ready for Launch?
            </h2>
            <p className="mb-10 leading-relaxed text-slate-500">
              You're about to dispatch{" "}
              <span className="font-bold text-slate-900">"{subject}"</span> to{" "}
              {selectedRecipientIds.length} selected recipients
              {selectedRecipientPreview.length > 0
                ? `, including ${selectedRecipientPreview.join(", ")}`
                : ""}
              . This action is irreversible.
            </p>

            <div className="space-y-3">
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="rounded-tile flex w-full cursor-pointer items-center justify-center gap-2 bg-slate-900 px-6 py-4 font-bold text-white shadow-xl shadow-slate-200 transition-colors hover:bg-black active:scale-[0.98] disabled:opacity-60"
              >
                {isLoading ? (
                  <ThinkingOrb
                    preset="working"
                    showLabel={false}
                    tone="ghost"
                    size="sm"
                    className="h-auto p-0 text-current [--orb-size:1.25rem]"
                  />
                ) : (
                  <>
                    <Send size={20} />
                    Confirm & Send
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="rounded-tile w-full cursor-pointer border-2 border-slate-100 bg-white px-6 py-4 font-bold text-slate-500 transition-colors hover:bg-slate-50 active:scale-[0.98]"
              >
                Go Back
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmBroadcastModal;
