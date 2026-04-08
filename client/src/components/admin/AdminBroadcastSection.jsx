import React from "react";
import { Send, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const AdminBroadcastSection = ({ onOpenComposer, sectionNumber = "02" }) => {
  return (
    <section>
      <div className="mb-4">
        <p className="font-mono text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
          Section {sectionNumber}
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
          Broadcast
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.32)] sm:p-8"
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 sm:h-16 sm:w-16">
              <Send size={32} strokeWidth={1.5} />
            </div>
            <p className="font-mono text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
              Broadcast Flow
            </p>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
              Send Product Updates
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
              Launch a polished feature announcement from a dedicated composer
              with audience selection, structured change blocks, and a final
              review pass before dispatch.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              "Select the exact audience before sending.",
              "Structure the update with intro, detail, and change blocks.",
              "Review delivery details before the queue is triggered.",
            ].map((line) => (
              <div
                key={line}
                className="rounded-[1.35rem] border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm font-semibold text-slate-700"
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-dashed border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-500">
            Open the composer when you’re ready to prepare the next
            announcement.
          </p>
          <button
            onClick={onOpenComposer}
            className="inline-flex items-center justify-center gap-2 rounded-[1.1rem] bg-[#1d4ed8] px-5 py-3 text-sm font-bold tracking-[0.16em] text-white uppercase shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1e40af]"
          >
            Open Composer
            <ChevronRight size={18} />
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default AdminBroadcastSection;
