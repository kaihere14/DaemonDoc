import React from "react";
import { Link } from "react-router-dom";
import { MotionConfig, motion } from "framer-motion";
import { DokuFigure } from "./Doku";
import { PRESS, chunkVariants, staggerVariants, useBlur } from "@/lib/motion";

const PRIMARY_BUTTON =
  "bg-primary text-white shadow-lg shadow-blue-500/20 hover:bg-blue-800";
const SECONDARY_BUTTON =
  "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50";

const ActionButton = ({ action, className }) => {
  const classes = `inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold ${PRESS} ${className}`;
  if (action.to) {
    return (
      <Link to={action.to} className={classes}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={classes}>
      {action.label}
    </button>
  );
};

/**
 * Empty and error states with Doku. Doku arrives first, then the title, the
 * explanation and the way forward, so the eye reads them in that order.
 * `detail` carries the raw error text, kept small and secondary.
 */
const DokuState = ({
  pose = "reading",
  title,
  description,
  detail,
  action,
  secondaryAction,
  tone = "neutral",
  size = "w-28",
  className = "",
}) => {
  const blur = useBlur();
  const chunk = chunkVariants(blur);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={`flex flex-col items-center text-center ${className}`}
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        role={tone === "error" ? "alert" : undefined}
      >
        <motion.div variants={chunk} className="mb-5">
          <DokuFigure pose={pose} className={size} />
        </motion.div>
        <motion.h3
          variants={chunk}
          className="mb-2 text-lg font-black tracking-tight text-slate-900 uppercase"
        >
          {title}
        </motion.h3>
        {description && (
          <motion.p
            variants={chunk}
            className="max-w-md text-sm text-slate-500"
          >
            {description}
          </motion.p>
        )}
        {detail && (
          <motion.p
            variants={chunk}
            className="mt-2 max-w-md font-mono text-[11px] text-slate-400"
          >
            {detail}
          </motion.p>
        )}
        {(action || secondaryAction) && (
          <motion.div
            variants={chunk}
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
          >
            {action && (
              <ActionButton action={action} className={PRIMARY_BUTTON} />
            )}
            {secondaryAction && (
              <ActionButton
                action={secondaryAction}
                className={SECONDARY_BUTTON}
              />
            )}
          </motion.div>
        )}
      </motion.div>
    </MotionConfig>
  );
};

export default DokuState;
