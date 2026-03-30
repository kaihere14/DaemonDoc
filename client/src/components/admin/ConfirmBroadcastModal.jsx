/* eslint-disable react/prop-types */
import React from "react";
import { Send, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ConfirmBroadcastModal = ({
  isOpen,
  subject,
  selectedRecipientIds,
  selectedRecipientPreview,
  isLoading,
  onConfirm,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-60 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_-36px_rgba(15,23,42,0.55)] sm:p-10"
          >
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
              <Check size={40} strokeWidth={2.5} />
            </div>

            <h2 className="mb-4 text-3xl font-black uppercase tracking-tight text-slate-900">
              Ready for Launch?
            </h2>
            <p className="mb-10 leading-relaxed text-slate-500">
              You're about to dispatch{" "}
              <span className="text-slate-900 font-bold">"{subject}"</span> to{" "}
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
                className="w-full px-6 py-4 rounded-2xl bg-slate-900 text-white font-bold shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={20} />
                    Confirm & Send
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-all"
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
