import React from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Github, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingNavigation = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = React.useState(true);
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { scrollY } = useScroll();
  const lastScrollY = React.useRef(0);

  // Dynamic navbar behavior - hide on scroll down, show on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    
    // Add blur/translucency after scrolling
    if (latest > 20) {
      setHasScrolled(true);
    } else {
      setHasScrolled(false);
    }

    // Hide/show logic
    if (latest > previous && latest > 150) {
      setIsVisible(false);
      setMobileMenuOpen(false); // Close mobile menu on scroll down
    } else {
      setIsVisible(true);
    }
    
    lastScrollY.current = latest;
  });

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: isVisible ? 0 : -120,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className={`fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
          hasScrolled 
            ? "w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] max-w-5xl" 
            : "w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] max-w-6xl"
        }`}
      >
        <div 
          className={`
            relative overflow-hidden rounded-xl sm:rounded-2xl border transition-all duration-500
            ${hasScrolled 
              ? "bg-white/80 backdrop-blur-2xl border-slate-200/60 shadow-lg shadow-slate-900/5" 
              : "bg-white/95 backdrop-blur-sm border-slate-200/40 shadow-sm"
            }
          `}
        >
          <div className="px-4 sm:px-6 md:px-8 h-14 sm:h-16 flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <motion.div 
                whileHover={{ rotate: 8, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-lg blur-sm opacity-20 group-hover:opacity-30 transition-opacity" />
                <img 
                  src="/logo.svg" 
                  alt="DaemonDoc Logo" 
                  className="relative w-8 h-8 sm:w-9 sm:h-9"
                />
              </motion.div>
              <span className="font-semibold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                DaemonDoc
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden md:flex items-center gap-1"
            >
              {/* Navigation Links */}
              <div className="flex items-center gap-1 mr-2">
                {[
                  { label: "How it works", id: "how-it-works" },
                  { label: "Features", id: "features" },
                  { label: "Security", id: "security" }
                ].map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    whileHover={{ backgroundColor: "rgb(248 250 252)" }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 transition-all relative group"
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/login")}
                className="relative overflow-hidden bg-slate-900 text-white pl-4 pr-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all group"
              >
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-slate-800 to-slate-900"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
                <Github size={15} strokeWidth={2} className="relative z-10" />
                <span className="relative z-10">Connect GitHub</span>
              </motion.button>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X size={20} className="text-slate-900" />
              ) : (
                <Menu size={20} className="text-slate-900" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: mobileMenuOpen ? 1 : 0,
          y: mobileMenuOpen ? 0 : -20,
          pointerEvents: mobileMenuOpen ? "auto" : "none"
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-18 sm:top-22 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] max-w-md md:hidden"
      >
        <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 space-y-2">
            {[
              { label: "How it works", id: "how-it-works" },
              { label: "Features", id: "features" },
              { label: "Security", id: "security" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/login");
              }}
              className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all mt-2"
            >
              <Github size={16} />
              Connect GitHub
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
        />
      )}
    </>
  );
};

export default LandingNavigation;

