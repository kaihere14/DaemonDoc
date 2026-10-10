"use client";

import { motion, useReducedMotion } from "framer-motion";

// Strong ease-out: most of the move lands in the first third, then it settles.
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait once in view. Use it to stage siblings, ~0.08s apart. */
  delay?: number;
  /** Starting blur in px. Keep it low on large surfaces, where blur is costly. */
  blur?: number;
  /** Starting offset in px; the element rises this far into place. */
  y?: number;
  as?: "div" | "li" | "section";
}

/**
 * Fades an element up out of a soft blur the first time it scrolls into view,
 * the way Apple and Cluely bring in their sections. It runs once, so content
 * never disappears again on the way back up.
 *
 * The blur is cleared to `none` when the move ends rather than left at
 * `blur(0px)`: any filter value turns the element into a backdrop root, and
 * that would stop `backdrop-blur` children from seeing the page behind them.
 *
 * Reduced motion keeps a plain opacity fade, with no rise and no blur.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  blur = 8,
  y = 24,
  as = "div",
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y, filter: `blur(${blur}px)` }
      }
      whileInView={
        reduceMotion
          ? { opacity: 1 }
          : {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transitionEnd: { filter: "none" },
            }
      }
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{
        duration: reduceMotion ? 0.3 : 0.9,
        delay,
        ease: EASE_OUT,
      }}
    >
      {children}
    </Component>
  );
}
