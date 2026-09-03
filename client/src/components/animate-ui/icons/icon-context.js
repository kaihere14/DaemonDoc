"use client";
import * as React from "react";

const AnimateIconContext = React.createContext(null);

function useAnimateIconContext() {
  const context = React.useContext(AnimateIconContext);
  if (!context)
    return {
      controls: undefined,
      animation: "default",
      loop: undefined,
      loopDelay: undefined,
      active: undefined,
      animate: undefined,
      initialOnAnimateEnd: undefined,
      completeOnStop: undefined,
      persistOnAnimateEnd: undefined,
      delay: undefined,
    };
  return context;
}

const staticAnimations = {
  path: {
    initial: { pathLength: 1 },

    animate: {
      pathLength: [0.05, 1],
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
  },

  "path-loop": {
    initial: { pathLength: 1 },

    animate: {
      pathLength: [1, 0.05, 1],
      transition: {
        duration: 1.6,
        ease: "easeInOut",
      },
    },
  },
};

function getVariants(animations) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { animation: animationType } = useAnimateIconContext();

  let result;

  if (animationType in staticAnimations) {
    const variant = staticAnimations[animationType];
    result = {};
    for (const key in animations.default) {
      if (
        (animationType === "path" || animationType === "path-loop") &&
        key.includes("group")
      )
        continue;
      result[key] = variant;
    }
  } else {
    result = animations[animationType] ?? animations.default;
  }

  return result;
}

export { AnimateIconContext, useAnimateIconContext, getVariants };
