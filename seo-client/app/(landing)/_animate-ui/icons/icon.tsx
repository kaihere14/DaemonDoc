"use client";
import * as React from "react";
import { motion, useAnimation } from "motion/react";

type AnimationControls = ReturnType<typeof useAnimation>;

import { cn } from "@/app/(landing)/_lib/utils";
import { useIsInView } from "@/app/(landing)/_hooks/use-is-in-view";
import { Slot } from "@/app/(landing)/_animate-ui/primitives/animate/slot";

const staticAnimations: Record<string, {
  initial: Record<string, unknown>;
  animate: Record<string, unknown>;
}> = {
  path: {
    initial: { pathLength: 1 },
    animate: {
      pathLength: [0.05, 1],
      transition: { duration: 0.8, ease: "easeInOut" },
    },
  },
  "path-loop": {
    initial: { pathLength: 1 },
    animate: {
      pathLength: [1, 0.05, 1],
      transition: { duration: 1.6, ease: "easeInOut" },
    },
  },
};

interface AnimateIconContextValue {
  controls: AnimationControls | undefined;
  animation: string;
  loop: boolean | undefined;
  loopDelay: number | undefined;
  active: boolean | undefined;
  animate: boolean | string | undefined;
  initialOnAnimateEnd: boolean | undefined;
  completeOnStop: boolean | undefined;
  persistOnAnimateEnd: boolean | undefined;
  delay: number | undefined;
}

const AnimateIconContext = React.createContext<AnimateIconContextValue | null>(null);

function useAnimateIconContext(): AnimateIconContextValue {
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

function composeEventHandlers<E extends React.SyntheticEvent>(
  theirs: React.EventHandler<E> | undefined,
  ours: React.EventHandler<E>,
): React.EventHandler<E> {
  return (event: E) => {
    theirs?.(event);
    ours(event);
  };
}

interface AnimateIconProps {
  asChild?: boolean;
  animate?: boolean | string;
  animateOnHover?: boolean | string;
  animateOnTap?: boolean | string;
  animateOnView?: boolean | string;
  animateOnViewMargin?: string;
  animateOnViewOnce?: boolean;
  animation?: string;
  loop?: boolean;
  loopDelay?: number;
  initialOnAnimateEnd?: boolean;
  completeOnStop?: boolean;
  persistOnAnimateEnd?: boolean;
  delay?: number;
  children?: React.ReactNode;
  [key: string]: unknown;
}

function AnimateIcon({
  asChild = false,
  animate = false,
  animateOnHover = false,
  animateOnTap = false,
  animateOnView = false,
  animateOnViewMargin = "0px",
  animateOnViewOnce = true,
  animation = "default",
  loop = false,
  loopDelay = 0,
  initialOnAnimateEnd = false,
  completeOnStop = false,
  persistOnAnimateEnd = false,
  delay = 0,
  children,
  ...props
}: AnimateIconProps) {
  const controls = useAnimation();

  const [localAnimate, setLocalAnimate] = React.useState(() => {
    if (animate === undefined || animate === false) return false;
    return delay <= 0;
  });
  const [currentAnimation, setCurrentAnimation] = React.useState(
    typeof animate === "string" ? animate : animation,
  );
  const [status, setStatus] = React.useState("initial");

  const delayRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopDelayRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnimateInProgressRef = React.useRef(false);
  const animateEndPromiseRef = React.useRef<Promise<void> | null>(null);
  const resolveAnimateEndRef = React.useRef<(() => void) | null>(null);
  const activeRef = React.useRef(localAnimate);

  const runGenRef = React.useRef(0);
  const cancelledRef = React.useRef(false);

  const bumpGeneration = React.useCallback(() => {
    runGenRef.current++;
  }, []);

  const startAnimation = React.useCallback(
    (trigger: boolean | string) => {
      const next = typeof trigger === "string" ? trigger : animation;
      bumpGeneration();
      if (delayRef.current) {
        clearTimeout(delayRef.current);
        delayRef.current = null;
      }
      setCurrentAnimation(next);
      if (delay > 0) {
        setLocalAnimate(false);
        delayRef.current = setTimeout(() => {
          setLocalAnimate(true);
        }, delay);
      } else {
        setLocalAnimate(true);
      }
    },
    [animation, delay, bumpGeneration],
  );

  const stopAnimation = React.useCallback(() => {
    bumpGeneration();
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    if (loopDelayRef.current) {
      clearTimeout(loopDelayRef.current);
      loopDelayRef.current = null;
    }
    setLocalAnimate(false);
  }, [bumpGeneration]);

  React.useEffect(() => {
    activeRef.current = localAnimate;
  }, [localAnimate]);

  React.useEffect(() => {
    if (animate === undefined) return;
    setCurrentAnimation(typeof animate === "string" ? animate : animation);
    if (animate) startAnimation(animate);
    else stopAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  React.useEffect(() => {
    return () => {
      if (delayRef.current) clearTimeout(delayRef.current);
      if (loopDelayRef.current) clearTimeout(loopDelayRef.current);
    };
  }, []);

  const viewOuterRef = React.useRef<Element>(null);
  const { ref: inViewRef, isInView } = useIsInView(viewOuterRef, {
    inView: !!animateOnView,
    inViewOnce: animateOnViewOnce,
    inViewMargin: animateOnViewMargin,
  });

  const startAnim = React.useCallback(
    async (anim: string, method: "start" | "set" = "start") => {
      try {
        await controls[method](anim);
        setStatus(anim);
      } catch {
        return;
      }
    },
    [controls],
  );

  React.useEffect(() => {
    if (!animateOnView) return;
    if (isInView) startAnimation(animateOnView);
    else stopAnimation();
  }, [isInView, animateOnView, startAnimation, stopAnimation]);

  React.useEffect(() => {
    const gen = ++runGenRef.current;
    cancelledRef.current = false;

    async function run() {
      if (cancelledRef.current || gen !== runGenRef.current) {
        await startAnim("initial");
        return;
      }

      if (!localAnimate) {
        if (
          completeOnStop &&
          isAnimateInProgressRef.current &&
          animateEndPromiseRef.current
        ) {
          try {
            await animateEndPromiseRef.current;
          } catch {
            // noop
          }
        }
        if (!persistOnAnimateEnd) {
          if (cancelledRef.current || gen !== runGenRef.current) {
            await startAnim("initial");
            return;
          }
          await startAnim("initial");
        }
        return;
      }

      if (loop) {
        if (cancelledRef.current || gen !== runGenRef.current) {
          await startAnim("initial");
          return;
        }
        await startAnim("initial", "set");
      }

      isAnimateInProgressRef.current = true;
      animateEndPromiseRef.current = new Promise((resolve) => {
        resolveAnimateEndRef.current = resolve;
      });

      if (cancelledRef.current || gen !== runGenRef.current) {
        isAnimateInProgressRef.current = false;
        resolveAnimateEndRef.current?.();
        resolveAnimateEndRef.current = null;
        animateEndPromiseRef.current = null;
        await startAnim("initial");
        return;
      }

      await startAnim("animate");

      if (cancelledRef.current || gen !== runGenRef.current) {
        isAnimateInProgressRef.current = false;
        resolveAnimateEndRef.current?.();
        resolveAnimateEndRef.current = null;
        animateEndPromiseRef.current = null;
        await startAnim("initial");
        return;
      }

      isAnimateInProgressRef.current = false;
      resolveAnimateEndRef.current?.();
      resolveAnimateEndRef.current = null;
      animateEndPromiseRef.current = null;

      if (initialOnAnimateEnd) {
        if (cancelledRef.current || gen !== runGenRef.current) {
          await startAnim("initial");
          return;
        }
        await startAnim("initial", "set");
      }

      if (loop) {
        if (loopDelay > 0) {
          await new Promise<void>((resolve) => {
            loopDelayRef.current = setTimeout(() => {
              loopDelayRef.current = null;
              resolve();
            }, loopDelay);
          });

          if (cancelledRef.current || gen !== runGenRef.current) {
            await startAnim("initial");
            return;
          }
          if (!activeRef.current) {
            if (status !== "initial" && !persistOnAnimateEnd)
              await startAnim("initial");
            return;
          }
        } else {
          if (!activeRef.current) {
            if (status !== "initial" && !persistOnAnimateEnd)
              await startAnim("initial");
            return;
          }
        }
        if (cancelledRef.current || gen !== runGenRef.current) {
          await startAnim("initial");
          return;
        }
        await run();
      }
    }

    void run();

    return () => {
      cancelledRef.current = true;
      if (delayRef.current) {
        clearTimeout(delayRef.current);
        delayRef.current = null;
      }
      if (loopDelayRef.current) {
        clearTimeout(loopDelayRef.current);
        loopDelayRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localAnimate, controls]);

  const childProps = React.isValidElement(children)
    ? (children.props as Record<string, unknown>)
    : {};

  const handleMouseEnter = composeEventHandlers(
    childProps.onMouseEnter as React.MouseEventHandler | undefined,
    () => {
      if (animateOnHover) startAnimation(animateOnHover);
    },
  );

  const handleMouseLeave = composeEventHandlers(
    childProps.onMouseLeave as React.MouseEventHandler | undefined,
    () => {
      if (animateOnHover || animateOnTap) stopAnimation();
    },
  );

  const handlePointerDown = composeEventHandlers(
    childProps.onPointerDown as React.PointerEventHandler | undefined,
    () => {
      if (animateOnTap) startAnimation(animateOnTap);
    },
  );

  const handlePointerUp = composeEventHandlers(
    childProps.onPointerUp as React.PointerEventHandler | undefined,
    () => {
      if (animateOnTap) stopAnimation();
    },
  );

  const content = asChild ? (
    <Slot
      ref={inViewRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      {...props}
    >
      {children}
    </Slot>
  ) : (
    <motion.span
      ref={inViewRef as React.Ref<HTMLSpanElement>}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      {...props}
    >
      {children}
    </motion.span>
  );

  return (
    <AnimateIconContext.Provider
      value={{
        controls,
        animation: currentAnimation,
        loop,
        loopDelay,
        active: localAnimate,
        animate,
        initialOnAnimateEnd,
        completeOnStop,
        persistOnAnimateEnd,
        delay,
      }}
    >
      {content}
    </AnimateIconContext.Provider>
  );
}

const pathClassName =
  "[&_[stroke-dasharray='1px_1px']]:![stroke-dasharray:1px_0px]";

interface IconWrapperProps {
  size?: number;
  animation?: string;
  animate?: boolean | string;
  animateOnHover?: boolean | string;
  animateOnTap?: boolean | string;
  animateOnView?: boolean | string;
  animateOnViewMargin?: string;
  animateOnViewOnce?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string; [key: string]: unknown }>;
  loop?: boolean;
  loopDelay?: number;
  persistOnAnimateEnd?: boolean;
  initialOnAnimateEnd?: boolean;
  delay?: number;
  completeOnStop?: boolean;
  className?: string;
  [key: string]: unknown;
}

function IconWrapper({
  size = 28,
  animation: animationProp,
  animate,
  animateOnHover,
  animateOnTap,
  animateOnView,
  animateOnViewMargin,
  animateOnViewOnce,
  icon: IconComponent,
  loop,
  loopDelay,
  persistOnAnimateEnd,
  initialOnAnimateEnd,
  delay,
  completeOnStop,
  className,
  ...props
}: IconWrapperProps) {
  const context = React.useContext(AnimateIconContext);

  if (context) {
    const {
      controls,
      animation: parentAnimation,
      loop: parentLoop,
      loopDelay: parentLoopDelay,
      active: parentActive,
      animate: parentAnimate,
      persistOnAnimateEnd: parentPersistOnAnimateEnd,
      initialOnAnimateEnd: parentInitialOnAnimateEnd,
      delay: parentDelay,
      completeOnStop: parentCompleteOnStop,
    } = context;

    const hasOverrides =
      animate !== undefined ||
      animateOnHover !== undefined ||
      animateOnTap !== undefined ||
      animateOnView !== undefined ||
      loop !== undefined ||
      loopDelay !== undefined ||
      initialOnAnimateEnd !== undefined ||
      persistOnAnimateEnd !== undefined ||
      delay !== undefined ||
      completeOnStop !== undefined;

    if (hasOverrides) {
      const inheritedAnimate = parentActive
        ? (animationProp ?? parentAnimation ?? "default")
        : false;

      const finalAnimate = animate ?? parentAnimate ?? inheritedAnimate;

      return (
        <AnimateIcon
          animate={finalAnimate}
          animateOnHover={animateOnHover}
          animateOnTap={animateOnTap}
          animateOnView={animateOnView}
          animateOnViewMargin={animateOnViewMargin}
          animateOnViewOnce={animateOnViewOnce}
          animation={animationProp ?? parentAnimation}
          loop={loop ?? parentLoop}
          loopDelay={loopDelay ?? parentLoopDelay}
          persistOnAnimateEnd={persistOnAnimateEnd ?? parentPersistOnAnimateEnd}
          initialOnAnimateEnd={initialOnAnimateEnd ?? parentInitialOnAnimateEnd}
          delay={delay ?? parentDelay}
          completeOnStop={completeOnStop ?? parentCompleteOnStop}
        >
          <IconComponent
            size={size}
            className={cn(
              className,
              ((animationProp ?? parentAnimation) === "path" ||
                (animationProp ?? parentAnimation) === "path-loop") &&
                pathClassName,
            )}
            {...props}
          />
        </AnimateIcon>
      );
    }

    const animationToUse = animationProp ?? parentAnimation;
    const loopToUse = parentLoop;
    const loopDelayToUse = parentLoopDelay;

    return (
      <AnimateIconContext.Provider
        value={{
          controls,
          animation: animationToUse,
          loop: loopToUse,
          loopDelay: loopDelayToUse,
          active: parentActive,
          animate: parentAnimate,
          initialOnAnimateEnd: parentInitialOnAnimateEnd,
          persistOnAnimateEnd: parentPersistOnAnimateEnd,
          delay: parentDelay,
          completeOnStop: parentCompleteOnStop,
        }}
      >
        <IconComponent
          size={size}
          className={cn(
            className,
            (animationToUse === "path" || animationToUse === "path-loop") &&
              pathClassName,
          )}
          {...props}
        />
      </AnimateIconContext.Provider>
    );
  }

  if (
    animate !== undefined ||
    animateOnHover !== undefined ||
    animateOnTap !== undefined ||
    animateOnView !== undefined ||
    animationProp !== undefined
  ) {
    return (
      <AnimateIcon
        animate={animate}
        animateOnHover={animateOnHover}
        animateOnTap={animateOnTap}
        animateOnView={animateOnView}
        animateOnViewMargin={animateOnViewMargin}
        animateOnViewOnce={animateOnViewOnce}
        animation={animationProp}
        loop={loop}
        loopDelay={loopDelay}
        delay={delay}
        completeOnStop={completeOnStop}
      >
        <IconComponent
          size={size}
          className={cn(
            className,
            (animationProp === "path" || animationProp === "path-loop") &&
              pathClassName,
          )}
          {...props}
        />
      </AnimateIcon>
    );
  }

  return (
    <IconComponent
      size={size}
      className={cn(
        className,
        (animationProp === "path" || animationProp === "path-loop") &&
          pathClassName,
      )}
      {...props}
    />
  );
}

function getVariants(animations: Record<string, Record<string, unknown>>) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { animation: animationType } = useAnimateIconContext();

  let result: Record<string, unknown>;

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
    result = (animations[animationType] ?? animations.default) as Record<string, unknown>;
  }

  return result;
}

export {
  pathClassName,
  staticAnimations,
  AnimateIcon,
  IconWrapper,
  useAnimateIconContext,
  getVariants,
};
