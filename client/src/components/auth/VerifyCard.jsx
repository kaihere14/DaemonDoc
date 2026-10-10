import React from "react";
import { DokuFigure } from "@/components/doku/Doku";

// Same three-part shape for every state, so the card doesn't jump as the
// status changes — only Doku's pose and the copy swap.
const STATUS_VIEW = {
  verifying: {
    pose: "working",
    title: "Verifying",
    body: "Please wait while we authenticate your account.",
  },
  success: {
    pose: "wave",
    title: "Success",
    body: "You've been authenticated. Taking you to your dashboard.",
  },
  error: {
    pose: "oops",
    title: "Authentication failed",
    body: "We couldn't verify this sign-in. Redirecting to login.",
  },
};

/** The card on /oauth-success while a GitHub sign-in is checked. */
const VerifyCard = ({ status }) => {
  const view = STATUS_VIEW[status] ?? STATUS_VIEW.verifying;

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-panel shadow-raised sm:rounded-panel-lg relative w-full max-w-md border border-slate-200 bg-white/90 p-8 text-center backdrop-blur-sm sm:p-10"
    >
      <div className="mb-6 flex justify-center">
        <DokuFigure pose={view.pose} className="w-24" />
      </div>

      <p className="mb-2 font-mono text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
        GitHub OAuth
      </p>
      <h1 className="mb-3 text-xl font-black tracking-tight text-slate-900 uppercase sm:text-2xl">
        {view.title}
      </h1>
      <p className="text-sm leading-relaxed text-slate-500">{view.body}</p>
    </div>
  );
};

export default VerifyCard;
