import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { label: "Solutions", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Product", href: "#engine" },
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
      className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${
        scrolled
          ? "py-2 bg-white/70 backdrop-blur-md border-b border-slate-200/50 shadow-sm"
          : " bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-[1400px] sm:mx-auto px-4 sm:px-6 lg:pr-22 lg:pl-6 w-full">
        <div
          className={`flex justify-between items-center transition-all duration-500 ${
            scrolled ? "h-14" : "h-20"
          } w-full`}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 justify-center">
            <img
              src="/DaemonLogo.png"
              alt="DaemonDoc"
              className={`transition-all duration-500 absolute left-0 sm:relative  ${
                scrolled ? "w-32 sm:w-36 md:w-48 scale-148 sm:scale-100" : "w-40 sm:w-45 md:w-60 scale-150 sm:scale-100"
              } self-center pt-2`}
            />
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 lg:pr-25">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-slate-600 hover:text-[#1d4ed8] font-medium text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex">
            <button
              onClick={() => navigate("/login")}
              className="bg-[#1d4ed8] text-shadow-sm cursor-pointer hover:bg-[#1e40af] text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-lg shadow-blue-500/30"
            >
              Get Started
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-slate-600 hover:text-[#1d4ed8] font-medium py-2.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-[#1d4ed8]  text-white px-6 py-3 rounded-full font-medium"
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
