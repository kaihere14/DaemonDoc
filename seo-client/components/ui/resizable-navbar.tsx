"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";

import React, { useEffect, useRef, useState } from "react";

/**
 * Perf notes (this deviates from the upstream aceternity registry on purpose):
 * - No `backdrop-filter`. A blur on a position:fixed bar forces the compositor to
 *   re-blur that region on every scroll frame, which is the main source of jank
 *   on a long landing page. A near-opaque background reads the same on a light page.
 * - Single cheap box-shadow instead of the upstream 6-layer stack (one layer had a
 *   68px blur radius, repainted per frame).
 * - Only `width` + `y` are animated, and only on the scroll threshold crossing —
 *   background/shadow are class toggles, not per-frame animated values.
 */

const SURFACE =
  "bg-white/95 shadow-[0_1px_0_rgba(0,0,0,0.04),0_4px_20px_rgba(34,42,53,0.10)]";

// `width` is a layout-driven property: every frame of this animation costs a
// relayout + repaint of the bar. A spring settles over ~600ms, so it thrashes for
// ~36 frames; a short tween keeps it to ~17 and reads snappier.
const RESIZE_TRANSITION = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
} as const;

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLElement>(null);
  // Page scroll only — passing a `target` makes framer re-measure this element on
  // every scroll event, which is wasted work for a position:fixed navbar.
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > 100;
    setVisible((prev) => (prev === next ? prev : next));
  });

  return (
    <motion.nav
      ref={ref}
      aria-label="Main"
      // Own compositing layer, so scrolling the page doesn't repaint the bar.
      style={{ willChange: "transform", transform: "translateZ(0)" }}
      className={cn("sticky inset-x-0 top-20 z-40 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.nav>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        width: visible ? "60%" : "100%",
        y: visible ? 16 : 0,
      }}
      transition={RESIZE_TRANSITION}
      // `contain` keeps the width spring's layout work inside the bar.
      style={{ minWidth: "720px", contain: "layout" }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 transition-colors duration-300 lg:flex",
        visible && SURFACE,
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="hover:text-primary relative rounded-full px-4 py-2 text-slate-600 transition-colors"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-gray-100"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        width: visible ? "92%" : "100%",
        y: visible ? 12 : 0,
      }}
      transition={RESIZE_TRANSITION}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between rounded-2xl bg-transparent px-3 py-2 transition-colors duration-300 lg:hidden",
        visible && SURFACE,
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    // An open sheet owns the viewport: let the page scroll under it and the
    // menu drifts away from the toggle that opened it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mobile-nav-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-2 rounded-2xl bg-white px-4 py-6 shadow-[var(--shadow-overlay)]",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      aria-controls="mobile-nav-menu"
      className="cursor-pointer rounded-lg p-2 text-slate-600 transition-colors hover:text-slate-900 active:bg-slate-100"
    >
      {isOpen ? <X size={22} /> : <Menu size={22} />}
    </button>
  );
};

export const NavbarLogo = () => {
  return (
    <a
      href="#"
      aria-label="DaemonDoc home"
      className="relative z-20 mr-4 flex shrink-0 transform-gpu items-center rounded-lg px-2 py-1 text-sm font-normal text-black"
    >
      <Image
        src="/DaemonLogo-nav.png"
        alt="DaemonDoc"
        width={406}
        height={120}
        priority
        className="h-8 w-auto md:h-9"
      />
    </a>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-4 py-2 rounded-md bg-white button bg-white text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  const variantStyles = {
    primary: "shadow-[0_1px_0_rgba(0,0,0,0.04),0_4px_20px_rgba(34,42,53,0.10)]",
    secondary: "bg-transparent shadow-none",
    dark: "bg-black text-white shadow-[0_1px_0_rgba(0,0,0,0.04),0_4px_20px_rgba(34,42,53,0.10)]",
    gradient:
      "bg-gradient-to-b from-[#209BFF] to-[#005FD6] text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
