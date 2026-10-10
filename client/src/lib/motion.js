import { useReducedMotion } from "framer-motion";

/* Shared motion language for the dashboard, following the design skills in
   .agents/skills. Entrances arrive fast and settle (strong ease-out or a
   critically damped spring); exits are shorter and smaller than entrances;
   state swaps cross-fade with a little blur. Movement, scale and blur all
   drop out under reduced motion, leaving the opacity fades. */
export const EASE_OUT = [0.23, 1, 0.32, 1];
export const SPRING = { type: "spring", duration: 0.35, bounce: 0 };
export const SWAP_SPRING = { type: "spring", duration: 0.3, bounce: 0 };
export const EXIT = { duration: 0.15, ease: EASE_OUT };

// One press for everything you can click: a 0.96 squeeze that never plays on
// a disabled control.
export const PRESS =
  "[-webkit-tap-highlight-color:transparent] transition-[scale,background-color,border-color,color,box-shadow,opacity] duration-150 ease-out-strong motion-safe:enabled:active:scale-[0.96]";
export const LINK_PRESS =
  "[-webkit-tap-highlight-color:transparent] transition-[scale,color] duration-150 ease-out-strong motion-safe:active:scale-[0.96]";

// Framer Motion's reduced-motion setting keeps filters running, so blur is
// switched off by hand.
export const useBlur = () => {
  const reduceMotion = useReducedMotion();
  return (px) => (reduceMotion ? "blur(0px)" : `blur(${px}px)`);
};

// A view's parts arrive in order, 100ms apart.
export const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
  exit: { opacity: 0, transition: EXIT },
};

export const chunkVariants = (blur) => ({
  hidden: { opacity: 0, transform: "translateY(12px)", filter: blur(4) },
  visible: {
    opacity: 1,
    transform: "translateY(0px)",
    filter: blur(0),
    transition: { duration: 0.3, ease: EASE_OUT },
  },
});
