"use client";

import { useCallback, useState } from "react";
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

const NAV_LINKS = [
  { name: "Solutions", link: "#features" },
  { name: "Features", link: "#engine" },
];

export default function LandingNavigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <Navbar className="fixed inset-x-0 top-0 z-50">
      {/* Desktop */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={NAV_LINKS} />
        <div className="flex transform-gpu items-center">
          <CandyLink href={`${APP_URL}/login`} className="px-6 py-2.5 text-sm">
            Get Started
          </CandyLink>
        </div>
      </NavBody>

      {/* Mobile */}
      <MobileNav>
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
              className="hover:text-primary w-full rounded-lg px-2 py-2.5 font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              {link.name}
            </a>
          ))}
          <div className="flex w-full flex-col">
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
