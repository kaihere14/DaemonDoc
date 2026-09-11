"use client";;
import * as React from "react";
import { createPortal } from "react-dom";
import { cva } from "class-variance-authority";
import {
  animate,
  AnimatePresence,
  motion,
  Reorder,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { Check, ChevronDown, ChevronUp, GripVertical, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * B6 UI: Sortable Dropdown
 *
 * A trigger that opens a popover holding a drag-to-rank list: top is primary,
 * everything under it is a fallback in order. Dragging is the fast path;
 * every row also carries up/down buttons, because a pointer-only drag leaves
 * keyboard users with no way to reorder anything.
 *
 * The panel opens on a spring, not a curve, matching the rest of B6's overlay
 * motion: an overlay that settles under a spring reads as a physical sheet,
 * one that eases in reads as a drawn fade.
 *
 * The panel is portaled to `document.body` and positioned from the trigger's
 * bounding rect, rather than absolutely positioned inside the trigger's own
 * wrapper. A dropdown is dropped into cards, toolbars and modals, all of
 * which routinely clip overflow; an absolutely positioned panel is silently
 * cropped by the nearest `overflow: hidden` ancestor, while a portaled one
 * escapes it the way any native dropdown would.
 *
 * The built-in apply button repeats Stateful Button's idle/loading/success/
 * error cycle rather than importing it, for the same reason the panel repeats
 * B6's button styling instead of importing Button Base: a registry item ships
 * source into a project that only installed this file.
 */
/**
 * B6 type steps, written as direct token reads.
 *
 * `text-body` and `text-primary-foreground` fall into the same tailwind-merge
 * class group unless cn() has been told the B6 scale is a font size, so under a
 * stock shadcn cn() the size silently deletes the colour and the label renders
 * in whatever colour it inherits, invisible on a solid button. Reading the
 * token directly lands the step in the font-size group for every cn(), extended
 * or not, and still loses to a consumer's own `text-lg`.
 */
const TYPE = {
  caption:
    "text-(length:--text-caption) leading-(--text-caption--line-height) tracking-(--text-caption--letter-spacing) font-(weight:--text-caption--font-weight)",

  small: "text-(length:--text-small) leading-(--text-small--line-height)",
  body: "text-(length:--text-body) leading-(--text-body--line-height)"
};

const POPOVER_SPRING = { type: "spring", duration: 0.5, bounce: 0.22 };
const ITEM_DRAG_TRANSITION = { type: "spring", duration: 0.4, bounce: 0.2 };
/** Settle for each row's own entrance, separate from the spring it reorders under while dragging. */
const ITEM_ENTRANCE_TRANSITION = { type: "spring", duration: 0.45, bounce: 0.15 };

/** Small round mark for an item: an image with a lettered fallback, used in the trigger stack and each row. */
export function SortableDropdownAvatar({
  src,
  alt,
  className,
  ...props
}) {
  const [broken, setBroken] = React.useState(false);

  if (!src || broken) {
    return (
      <span
        data-slot="sortable-dropdown-avatar"
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground font-bold text-background",
          TYPE.caption,
          className,
        )}
        {...props}
      >
        {alt.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      data-slot="sortable-dropdown-avatar"
      src={src}
      alt={alt}
      className={cn(
        "size-6 shrink-0 rounded-full border border-border bg-background object-contain",
        className,
      )}
      onError={() => setBroken(true)}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Trigger                                   */
/* -------------------------------------------------------------------------- */

const sortableDropdownTriggerVariants = cva(
  [
    "relative inline-flex w-full shrink-0 items-center gap-2 rounded-md border font-medium",
    "transition-colors duration-150 ease-b6",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "sm:w-auto",
  ],
  {
    variants: {
      variant: {
        outline: "border-border bg-background text-foreground shadow-b6-xs hover:bg-muted",
        ghost: "border-transparent bg-muted/60 text-foreground hover:bg-muted",
      },
      size: {
        sm: `h-9 px-2.5 ${TYPE.small}`,
        md: `h-10 px-3 ${TYPE.body}`,
        lg: `h-11 px-3.5 ${TYPE.body}`,
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  },
);

/**
 * Positioned with inline `top`/`left`/`right` from the trigger's measured
 * rect (see `SortableDropdown`), not with Tailwind inset utilities: the panel
 * is portaled to `document.body`, so it has no positioned ancestor to anchor
 * `absolute` against.
 */
const sortableDropdownContentClass =
  "fixed z-50 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-b6-lg sm:w-80 md:w-96";

const applyButtonVariants = cva(
  [
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2",
    "font-medium whitespace-nowrap select-none",
    "transition-[background-color,color,border-color,box-shadow] duration-200 ease-b6",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-primary-foreground shadow-b6-sm",
          "hover:brightness-[1.06] active:brightness-[0.97]",
        ],
        secondary:
          "bg-secondary text-secondary-foreground shadow-b6-xs hover:bg-accent hover:text-accent-foreground",
        outline:
          "border border-border bg-background text-foreground shadow-b6-xs hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        destructive: [
          "bg-destructive text-destructive-foreground shadow-b6-sm",
          "hover:brightness-[1.06] active:brightness-[0.97]",
        ],
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: `h-8 rounded-sm px-3 ${TYPE.small}`,
        md: `h-10 rounded-md px-4 ${TYPE.body}`,
        lg: `h-12 rounded-md px-6 ${TYPE.body}`,
        icon: "size-10 rounded-md p-0",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      block: true,
    },
  },
);

/** Blur-scale-fade for the status swap. Quick enough to read as a ticker, not a morph. */
const APPLY_CONTENT_TRANSITION = { duration: 0.35, ease: [0.2, 0, 0, 1] };
/** Error shake: a quick horizontal rattle that decays. */
const APPLY_SHAKE_KEYFRAMES = [0, -6, 6, -4, 4, -2, 2, 0];
const APPLY_SHAKE_DURATION = 0.4;
/** Default time before auto-resetting from success/error to idle, in ms. */
const DEFAULT_APPLY_RESET_DELAY = 2000;

/**
 * The apply action, driven by `status` exactly like Stateful Button: idle,
 * loading (spinner), success (check) and error (cross, with a shake) each
 * cross-fade their icon and label. Interaction is blocked outside `idle`, so
 * a second click can't land mid-request.
 */
function SortableDropdownApplyButton({
  status,
  disabled,
  onClick,
  idleLabel,
  loadingLabel,
  successLabel,
  errorLabel,
  variant,
  size,
  block
}) {
  const reducedMotion = useReducedMotion();
  const shakeX = useMotionValue(0);

  React.useEffect(() => {
    if (status === "error" && !reducedMotion) {
      animate(shakeX, APPLY_SHAKE_KEYFRAMES, {
        duration: APPLY_SHAKE_DURATION,
        ease: "easeOut",
      });
    }
  }, [status, reducedMotion, shakeX]);

  const icon =
    status === "loading" ? (
      <Loader2 aria-hidden className="animate-spin" />
    ) : status === "success" ? (
      <Check aria-hidden />
    ) : status === "error" ? (
      <X aria-hidden />
    ) : null;

  const currentLabel =
    status === "loading"
      ? loadingLabel
      : status === "success"
        ? successLabel
        : status === "error"
          ? errorLabel
          : idleLabel;

  const contentTransition = reducedMotion ? { duration: 0 } : APPLY_CONTENT_TRANSITION;
  const staggered = !reducedMotion;

  // The icon and each character of the label are separate items under one
  // staggered container, so a status swap reads as a ticker rather than the
  // whole label fading as one block.
  const contentContainer = {
    initial: {},
    animate: { transition: { staggerChildren: staggered ? 0.02 : 0 } },
    exit: {
      transition: { staggerChildren: staggered ? 0.01 : 0, staggerDirection: -1 },
    },
  };
  const contentItem = {
    initial: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: contentTransition },
    exit: { opacity: 0, scale: 0.95, filter: "blur(4px)", transition: contentTransition },
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || status !== "idle"}
      aria-busy={status === "loading" || undefined}
      data-status={status}
      style={{ x: shakeX }}
      className={cn(applyButtonVariants({ variant, size, block }))}
    >
      <motion.span layout="size" className="inline-flex justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={status}
            variants={contentContainer}
            initial={reducedMotion ? false : "initial"}
            animate="animate"
            exit="exit"
            className="inline-flex items-center gap-2"
          >
            {icon && (
              <motion.span variants={contentItem} className="inline-flex items-center">
                {icon}
              </motion.span>
            )}
            <span aria-live="polite" className="inline-flex">
              {typeof currentLabel === "string" ? (
                currentLabel.split("").map((char, index) => (
                  <motion.span
                    key={index}
                    variants={contentItem}
                    className="inline-block whitespace-pre"
                  >
                    {char}
                  </motion.span>
                ))
              ) : (
                <motion.span variants={contentItem}>{currentLabel}</motion.span>
              )}
            </span>
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}

export const SortableDropdown = React.forwardRef(function SortableDropdown(
  {
    className,
    variant,
    size,
    items,
    order,
    defaultOrder,
    onOrderChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    align = "end",
    triggerIcon,
    label,
    eyebrow,
    description,
    note,
    onApply,
    applyLabel = "Apply order",
    applyLoadingLabel = "Applying…",
    applySuccessLabel = "Applied",
    applyErrorLabel = "Couldn't apply",
    applyResetDelay = DEFAULT_APPLY_RESET_DELAY,
    applyVariant,
    applySize,
    applyStatus,
    footer,
    staggerDelay = 0.09,
    ...props
  },
  ref,
) {
  const containerRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);
  React.useImperativeHandle(ref, () => containerRef.current);

  // The portal target only exists client-side. Rendering it straight away
  // would try to read `document` during server rendering and crash the
  // page, so the first client render still renders nothing (matching the
  // server) and this flips true one render later, once mounted.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const [coords, setCoords] = React.useState();

  const itemsById = React.useMemo(() => {
    const map = new Map();
    for (const item of items) map.set(item.id, item);
    return map;
  }, [items]);
  const fallbackOrder = React.useMemo(() => items.map((item) => item.id), [items]);

  const [uncontrolledOrder, setUncontrolledOrder] = React.useState(
    defaultOrder ?? fallbackOrder,
  );
  const isOrderControlled = order !== undefined;
  const currentOrder = isOrderControlled ? order : uncontrolledOrder;

  const setOrder = (next) => {
    if (!isOrderControlled) setUncontrolledOrder(next);
    onOrderChange?.(next);
  };

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isOpenControlled = openProp !== undefined;
  const open = isOpenControlled ? openProp : uncontrolledOpen;

  const setOpen = (next) => {
    if (!isOpenControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  // Reset the dirty baseline on the transition into `open`, not on every
  // reorder while it stays open. A render-time adjustment (React's own
  // alternative to an effect that only mirrors state) instead of an effect,
  // so the reset lands in the same render as the open change.
  const [wasOpen, setWasOpen] = React.useState(open);
  const [baselineOrder, setBaselineOrder] = React.useState(currentOrder);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setBaselineOrder(currentOrder);
  }

  const isDirty = JSON.stringify(currentOrder) !== JSON.stringify(baselineOrder);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      const target = event.target;
      if (containerRef.current?.contains(target)) return;
      if (contentRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // The panel is portaled to `document.body`, so it has to be positioned by
  // hand from the trigger's own rect instead of an `absolute` inset. Reruns
  // on scroll and resize so the panel tracks the trigger while it is open.
  React.useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCoords(
        align === "start"
          ? { top: rect.bottom + 8, left: rect.left }
          : { top: rect.bottom + 8, right: window.innerWidth - rect.right },
      );
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, align]);

  const moveBy = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= currentOrder.length) return;
    const next = currentOrder.slice();
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  };

  const [internalApplyStatus, setInternalApplyStatus] =
    React.useState("idle");
  const isApplyControlled = applyStatus !== undefined;
  const currentApplyStatus = isApplyControlled ? applyStatus : internalApplyStatus;

  // Auto-reset out of `success` / `error` back to `idle`. Only owned here
  // when the status is uncontrolled; a caller driving `applyStatus` decides
  // its own timing.
  React.useEffect(() => {
    if (isApplyControlled) return;
    if (internalApplyStatus !== "success" && internalApplyStatus !== "error") return;
    if (applyResetDelay <= 0) return;
    const timer = setTimeout(() => setInternalApplyStatus("idle"), applyResetDelay);
    return () => clearTimeout(timer);
  }, [internalApplyStatus, applyResetDelay, isApplyControlled]);

  const handleApply = async () => {
    if (!onApply) return;
    if (isApplyControlled) {
      void onApply(currentOrder);
      return;
    }
    setInternalApplyStatus("loading");
    try {
      await onApply(currentOrder);
      setBaselineOrder(currentOrder);
      setInternalApplyStatus("success");
    } catch {
      setInternalApplyStatus("error");
    }
  };

  const prefersReducedMotion = useReducedMotion();
  const hidden = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 };
  const shown = prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 };

  // Rows cascade in top to bottom on open instead of appearing all at once:
  // the list is one staggered container, each row one of its children.
  const listVariants = {
    hidden: {},
    visible: {
      transition: prefersReducedMotion
        ? {}
        : { staggerChildren: staggerDelay, delayChildren: staggerDelay },
    },
  };
  const listItemVariants = {
    hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion ? { duration: 0 } : ITEM_ENTRANCE_TRANSITION,
    },
  };

  return (
    <div
      ref={containerRef}
      data-slot="sortable-dropdown"
      className={cn("w-full sm:inline-block sm:w-auto", className)}
      {...props}
    >
      <button
        ref={triggerRef}
        type="button"
        data-slot="sortable-dropdown-trigger"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(sortableDropdownTriggerVariants({ variant, size }))}
      >
        {triggerIcon}
        <span className="truncate">{label}</span>
        <span className="ml-auto flex items-center -space-x-1.5 sm:ml-0">
          {currentOrder.map((id) => (
            <span
              key={id}
              className="rounded-full border border-background bg-background shadow-b6-xs"
            >
              {itemsById.get(id)?.icon}
            </span>
          ))}
        </span>
        <ChevronDown
          aria-hidden
          size={16}
          className={cn(
            "shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && coords && (
              <motion.div
                ref={contentRef}
                data-slot="sortable-dropdown-content"
                role="group"
                aria-label={typeof label === "string" ? label : undefined}
                initial={hidden}
                animate={shown}
                exit={hidden}
                transition={POPOVER_SPRING}
                style={{ transformOrigin: "top", ...coords }}
                className={sortableDropdownContentClass}
              >
                {(eyebrow ?? label) && (
                  <p
                    className={cn(
                      "mb-1 font-mono font-black text-muted-foreground uppercase",
                      TYPE.caption,
                    )}
                  >
                    {eyebrow ?? label}
                  </p>
                )}
                {description && (
                  <p className={cn("mb-3 text-muted-foreground", TYPE.small)}>
                    {description}
                  </p>
                )}
                {note && (
                  <div
                    className={cn(
                      "mb-3 rounded-md border border-border bg-muted/60 px-2.5 py-2 text-muted-foreground",
                      TYPE.small,
                    )}
                  >
                    {note}
                  </div>
                )}

                <Reorder.Group
                  as="ul"
                  axis="y"
                  values={currentOrder}
                  onReorder={setOrder}
                  className="space-y-2"
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {currentOrder.map((id, index) => {
                    const item = itemsById.get(id);
                    if (!item) return null;
                    return (
                      <Reorder.Item
                        as="li"
                        key={id}
                        value={id}
                        data-slot="sortable-dropdown-item"
                        className="flex cursor-grab items-center gap-3 rounded-md border border-border bg-muted/60 p-2.5 active:cursor-grabbing"
                        variants={listItemVariants}
                        whileDrag={{ scale: 1.02, boxShadow: "var(--shadow-b6-lg)" }}
                        transition={ITEM_DRAG_TRANSITION}
                      >
                        <GripVertical
                          aria-hidden
                          size={16}
                          className="shrink-0 text-muted-foreground/60"
                        />
                        {item.icon}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p
                              className={cn(
                                "truncate font-semibold text-foreground",
                                TYPE.small,
                              )}
                            >
                              {item.label}
                            </p>
                            {item.badge}
                          </div>
                          <p className={cn("truncate text-muted-foreground", TYPE.caption)}>
                            {item.description ??
                              (index === 0 ? "Primary" : `Fallback ${index}`)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col">
                          <button
                            type="button"
                            aria-label={`Move ${item.label} up`}
                            disabled={index === 0}
                            onClick={() => moveBy(index, -1)}
                            className="rounded-xs p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30"
                          >
                            <ChevronUp aria-hidden size={14} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Move ${item.label} down`}
                            disabled={index === currentOrder.length - 1}
                            onClick={() => moveBy(index, 1)}
                            className="rounded-xs p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30"
                          >
                            <ChevronDown aria-hidden size={14} />
                          </button>
                        </div>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>

                {footer ??
                  (onApply && (
                    <div className="mt-3">
                      <SortableDropdownApplyButton
                        status={currentApplyStatus}
                        disabled={!isDirty}
                        onClick={handleApply}
                        idleLabel={applyLabel}
                        loadingLabel={applyLoadingLabel}
                        successLabel={applySuccessLabel}
                        errorLabel={applyErrorLabel}
                        variant={applyVariant}
                        size={applySize}
                      />
                    </div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
});

export { sortableDropdownTriggerVariants, applyButtonVariants };
