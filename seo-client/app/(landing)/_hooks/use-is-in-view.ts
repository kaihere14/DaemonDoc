"use client";

import * as React from "react";
import { useInView } from "motion/react";

interface UseIsInViewOptions {
  inView?: boolean;
  inViewOnce?: boolean;
  inViewMargin?: string;
}

export function useIsInView(
  ref: React.RefObject<Element | null>,
  options: UseIsInViewOptions = {},
) {
  const { inView, inViewOnce = false, inViewMargin = "0px" } = options;
  const localRef = React.useRef<Element>(null);
  React.useImperativeHandle(ref, () => localRef.current as Element);
  const inViewResult = useInView(localRef, {
    once: inViewOnce,
    // @ts-expect-error - margin is a valid option in motion/react but not in older type defs
    margin: inViewMargin,
  });
  const isInView = !inView || inViewResult;
  return { ref: localRef, isInView };
}
