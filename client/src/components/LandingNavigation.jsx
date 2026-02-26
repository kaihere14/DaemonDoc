import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { label: "Solutions", href: "#features" },
  { label: "Product", href: "#engine" },
  { label: "Pricing", href: "#pricing" },
];

const LandingNavigation = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-white/80 glass-effect border-b border-slate-100 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto pr-4 lg:pr-22 lg:pl-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 justify-center">
            
              <img src="/DaemonLogo.png" alt="DaemonDoc" className="w-45 md:w-60 self-center pt-2 mr-55 md:mr-0" />
  
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
              className="bg-[#1d4ed8] cursor-pointer hover:bg-[#1e40af] text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-lg shadow-blue-500/30"
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
              className="w-full bg-[#1d4ed8] text-white px-6 py-3 rounded-full font-medium"
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
