import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
  const reduceMotion = useReducedMotion();
  const blur = (px) => (reduceMotion ? "blur(0px)" : `blur(${px}px)`);

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

export default Doku;
