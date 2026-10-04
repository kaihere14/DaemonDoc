"use client";

import { useCallback, useState } from "react";
import { useScroll, useMotionValueEvent } from "motion/react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { CandyLink } from "@/components/ui/candy-button";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://app.daemondoc.online";

// Root-relative so the links also work from the inner pages. Listed in the
// order the sections appear on the home page.
const NAV_LINKS = [
  { name: "How it works", link: "/#how-it-works" },
  { name: "Testimonials", link: "/#testimonials" },
  { name: "Features", link: "/#features" },
];

interface LandingNavigationProps {
  /** False on pages without the hero photo, where white text would vanish. */
  overPhoto?: boolean;
}

export default function LandingNavigation({
  overPhoto = true,
}: LandingNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // The bar floats over the hero photo until it picks up its own white surface,
  // so above the fold the wordmark and slate links have to flip to white. The
  // mascot keeps its own colors.
  // Same 100px threshold the Navbar uses to swap in that surface.
  const { scrollY } = useScroll();
  const [onPhoto, setOnPhoto] = useState(overPhoto);
  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = overPhoto && latest <= 100;
    setOnPhoto((prev) => (prev === next ? prev : next));
  });

  const invertedLogo = "[&_.wordmark]:text-white";

  return (
    <Navbar className="fixed inset-x-0 top-0 z-50">
      {/* Desktop */}
      <NavBody className={onPhoto ? invertedLogo : undefined}>
        <NavbarLogo />
        <NavItems
          items={NAV_LINKS}
          className={
            onPhoto
              ? "[&_a]:text-white [&_a:hover]:text-white [&_a>div]:bg-white/20"
              : undefined
          }
        />
        {/* relative z-20 + transform-gpu: NavItems is an `absolute inset-0`
            overlay, so the CTA needs its own stacking context to stay clickable. */}
        <div className="relative z-20 flex transform-gpu items-center">
          <CandyLink href={`${APP_URL}/login`} className="px-6 py-2.5 text-sm">
            Get Started
          </CandyLink>
        </div>
      </NavBody>

      {/* Mobile */}
      <MobileNav
        className={
          onPhoto
            ? "[&>div:first-child_.wordmark]:text-white [&>div:first-child_button]:text-white"
            : undefined
        }
      >
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          />
        </MobileNavHeader>

        <MobileNavMenu isOpen={mobileOpen} onClose={closeMobile}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.link}
              onClick={closeMobile}
              className="hover:text-primary w-full rounded-lg px-3 py-3 font-medium text-slate-600 transition-colors hover:bg-slate-50 active:bg-slate-100"
            >
              {link.name}
            </a>
          ))}
          <div className="mt-2 flex w-full flex-col">
            <CandyLink
              href={`${APP_URL}/login`}
              className="w-full"
              onClick={closeMobile}
            >
              Get Started
            </CandyLink>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
