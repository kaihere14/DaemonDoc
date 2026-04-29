import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { label: "Solutions", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Features", href: "#engine" },
];

const LandingNavigation = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed z-50 w-full transition-all duration-500 ease-in-out ${
        scrolled
          ? "border-b border-slate-200/50 bg-white/70 py-2 shadow-sm backdrop-blur-md"
          : " border-b border-transparent bg-transparent"
      }`}
    >
      <div className="w-full max-w-[1400px] px-4 sm:mx-auto sm:px-6 lg:pr-22 lg:pl-6">
        <div
          className={`flex items-center justify-between transition-all duration-500 ${
            scrolled ? "h-14" : "h-20"
          } w-full`}
        >
          {/* Logo */}
          <a href="#" className="flex items-center justify-center gap-2">
            <img
              src="/DaemonLogo.png"
              alt="DaemonDoc"
              className={`absolute left-0 transition-all duration-500 sm:relative ${
                scrolled
                  ? "w-32 scale-148 sm:w-36 sm:scale-100 md:w-48"
                  : "w-40 scale-150 sm:w-45 sm:scale-100 md:w-60"
              } self-center pt-2`}
            />
          </a>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-8 md:flex lg:pr-25">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-[#1d4ed8]"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex">
            <button
              onClick={() => navigate("/login")}
              className="cursor-pointer rounded-full bg-[#1d4ed8] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all text-shadow-sm hover:bg-[#1e40af]"
            >
              Get Started
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="cursor-pointer p-2 text-slate-600 hover:text-slate-900 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="space-y-1 border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-2 py-2.5 font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#1d4ed8]"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-full bg-[#1d4ed8] px-6 py-3 font-medium text-white"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavigation;
