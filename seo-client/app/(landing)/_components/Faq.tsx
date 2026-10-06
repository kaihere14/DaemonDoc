"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SECTION_X, SECTION_Y } from "@/app/(landing)/_lib/section";

const QUESTIONS = [
  {
    question: "How does DaemonDoc keep my README up to date?",
    answer:
      "Connect a repository once, then keep working as usual. DaemonDoc listens for GitHub pushes, reviews the changed code, and updates the relevant README sections when your documentation needs to change.",
  },
  {
    question: "Will it rewrite my whole README every time?",
    answer:
      "No. DaemonDoc is designed to update the sections affected by your changes, so the rest of your README stays intact instead of being replaced by a fresh generic document.",
  },
  {
    question: "Does DaemonDoc support monorepos?",
    answer:
      "Yes. You can connect monorepos and let DaemonDoc work with the documentation structure already used by your projects.",
  },
  {
    question: "What access does DaemonDoc need?",
    answer:
      "DaemonDoc uses scoped GitHub OAuth access to connect the repositories you choose. Access tokens are encrypted, and the service is built to keep secrets and internal configuration out of generated documentation.",
  },
  {
    question: "Can I review documentation changes before publishing?",
    answer:
      "Yes. Documentation updates are made as GitHub changes, giving your existing repository workflow a clear place to review what changed.",
  },
  {
    question: "How much does DaemonDoc cost?",
    answer:
      "DaemonDoc is currently available to get started with at no cost. Connect a repository and see how continuous documentation fits into your workflow.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const panelId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className={`${SECTION_X} ${SECTION_Y}`}
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16 xl:gap-24">
        <div className="lg:col-span-5">
          <p className="text-primary mb-4 text-sm font-medium tracking-wide">
            Questions, answered
          </p>
          <h2
            id="faq-heading"
            className="font-display max-w-md text-4xl font-bold text-slate-900 sm:text-5xl"
          >
            Everything you need to know before you connect.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600">
            A quick look at how DaemonDoc fits into your GitHub workflow.
          </p>
        </div>

        <div className="lg:col-span-7">
          <div className="border-t border-slate-200">
            {QUESTIONS.map((item, index) => {
              const isOpen = openIndex === index;
              const contentId = `${panelId}-${index}`;

              return (
                <div key={item.question} className="border-b border-slate-200">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={contentId}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left text-base font-normal text-slate-700 sm:py-7 sm:text-lg"
                    >
                      <span>{item.question}</span>
                      <span
                        aria-hidden="true"
                        className="text-primary relative flex size-6 shrink-0 items-center justify-center"
                      >
                        <span className="absolute h-px w-4 bg-current" />
                        <motion.span
                          className="absolute h-4 w-px bg-current"
                          animate={{ rotate: isOpen ? 90 : 0 }}
                          transition={{ duration: reduceMotion ? 0 : 0.2 }}
                        />
                      </span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={contentId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: {
                            duration: reduceMotion ? 0 : 0.32,
                            ease: [0.16, 1, 0.3, 1],
                          },
                          opacity: { duration: reduceMotion ? 0 : 0.18 },
                        }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pr-10 pb-7 text-sm leading-relaxed text-slate-600 sm:pb-8 sm:text-base">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
