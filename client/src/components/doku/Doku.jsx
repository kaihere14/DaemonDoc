import React from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { EASE_OUT, useBlur } from "@/lib/motion";

// Square WebP exports of the masters in logo-candidates/doku, cropped to the
// character and sized for 2x screens at up to 160px.
const POSE_NAMES = [
  "wave",
  "working",
  "celebrate",
  "oops",
  "point",
  "reading",
  "resting",
];
const POSES = Object.fromEntries(
  POSE_NAMES.map((name) => [name, `/doku/doku-${name}.webp`]),
);

// Poses drawn mid-hop, so their shadow sits further below them.
const AIRBORNE_POSES = new Set(["celebrate"]);

const SWAP_SPRING = { type: "spring", duration: 0.35, bounce: 0 };

// Only "working" moves on its own, so idle motion always means Doku is busy.
const Doku = ({ pose = "wave", className = "" }) => (
  <img
    src={POSES[pose] ?? POSES.wave}
    alt=""
    aria-hidden
    width={320}
    height={320}
    draggable={false}
    className={`h-auto shrink-0 select-none ${
      pose === "working" ? "motion-safe:animate-doku-bob" : ""
    } ${className}`}
  />
);

/**
 * Doku changing pose cross-fades rather than cutting, with a little blur to
 * blend the two drawings into one movement. The first pose renders as-is so
 * nothing animates on page load.
 */
export const DokuSwap = ({ pose, className = "" }) => {
  const blur = useBlur();

  return (
    <span className={`grid shrink-0 ${className}`}>
      <AnimatePresence initial={false}>
        <motion.span
          key={pose}
          className="[grid-area:1/1]"
          initial={{ opacity: 0, scale: 0.9, filter: blur(4) }}
          animate={{ opacity: 1, scale: 1, filter: blur(0) }}
          exit={{ opacity: 0, scale: 0.9, filter: blur(4) }}
          transition={SWAP_SPRING}
        >
          <Doku pose={pose} className="w-full" />
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

/**
 * Doku standing on the page: a soft contact shadow sits under the feet and
 * shrinks when Doku is mid-hop, the way a real shadow would. Landing on
 * "oops" gives one small flinch. Pose changes cross-fade. Usable anywhere:
 * it carries its own reduced-motion setting.
 */
export const DokuFigure = ({ pose, className = "w-28" }) => {
  const airborne = AIRBORNE_POSES.has(pose);

  return (
    <MotionConfig reducedMotion="user">
      <span
        className={`relative flex shrink-0 flex-col items-center ${className}`}
      >
        <motion.span
          className="relative z-10 block w-full"
          style={{ transformOrigin: "50% 90%" }}
          animate={pose === "oops" ? { rotate: [0, -6, 4, 0] } : { rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: "easeInOut" }}
        >
          <DokuSwap pose={pose} className="w-full" />
        </motion.span>
        <motion.span
          aria-hidden
          className="-mt-2 h-2.5 w-[62%] rounded-[50%] bg-slate-900/12 blur-[3px]"
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={{
            opacity: airborne ? 0.55 : 1,
            scaleX: airborne ? 0.62 : 1,
          }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.15 }}
        />
      </span>
    </MotionConfig>
  );
};

export default Doku;
