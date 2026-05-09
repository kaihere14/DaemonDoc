"use client";
import * as React from "react";
import { motion, isMotionComponent } from "motion/react";
import { cn } from "@/app/(landing)/_lib/utils";

function mergeRefs(...refs: (React.Ref<unknown> | undefined)[]) {
  return (node: unknown) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node as never);
      } else {
        (ref as React.MutableRefObject<unknown>).current = node;
      }
    });
  };
}

function mergeProps(
  childProps: Record<string, unknown>,
  slotProps: Record<string, unknown>,
) {
  const merged = { ...childProps, ...slotProps };

  if (childProps.className || slotProps.className) {
    merged.className = cn(
      childProps.className as string | undefined,
      slotProps.className as string | undefined,
    );
  }

  if (childProps.style || slotProps.style) {
    merged.style = {
      ...(childProps.style as object | undefined),
      ...(slotProps.style as object | undefined),
    };
  }

  return merged;
}

interface SlotProps {
  children?: React.ReactNode;
  ref?: React.Ref<unknown>;
  [key: string]: unknown;
}

function Slot({ children, ref, ...props }: SlotProps) {
  if (!React.isValidElement(children)) return null;

  const isAlreadyMotion =
    typeof children.type === "object" &&
    children.type !== null &&
    isMotionComponent(children.type as Parameters<typeof isMotionComponent>[0]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const Base = React.useMemo(
    () =>
      isAlreadyMotion
        ? (children.type as React.ComponentType)
        : motion.create(children.type as string),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAlreadyMotion, children.type],
  );

  const { ref: childRef, ...childProps } = children.props as {
    ref?: React.Ref<unknown>;
    [key: string]: unknown;
  };

  const mergedProps = mergeProps(childProps, props);

  return (
    // @ts-expect-error - dynamic motion component ref typing
    <Base {...mergedProps} ref={mergeRefs(childRef, ref)} />
  );
}

export { Slot };
