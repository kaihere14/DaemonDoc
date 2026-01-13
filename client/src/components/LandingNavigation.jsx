import React from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { Github, Menu, X, Terminal, Cpu } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingNavigation = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = React.useState(true);
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { scrollY } = useScroll();
  const lastScrollY = React.useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    setHasScrolled(latest > 20);

    // Hide on scroll down, show on scroll up
    if (latest > previous && latest > 150) {
      setIsVisible(false);
      setMobileMenuOpen(false);
    } else {
      setIsVisible(true);
    }
    lastScrollY.current = latest;
  });

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xs bg-linear-to-t from-white/10 via-white/50 to-white/95"
      >
        <div className="max-w-[1440px] mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo - Kept exactly as you provided */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => scrollToSection("hero")}
          >
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="relative sm:pl-6"
            >
              <div className="absolute inset-0  rounded-lg blur-sm opacity-20 group-hover:opacity-30 transition-opacity" />
              <img
                src="/logo.svg"
                alt="DaemonDoc Logo"
                className="relative  w-8 h-8 sm:w-9 sm:h-9"
              />
            </motion.div>
            <span className="font-black text-lg sm:text-xl tracking-tighter text-slate-900">
              DAEMONDOC
            </span>
          </motion.div>

          {/* Desktop Navigation - High Density */}
          <div className="hidden md:flex items-center gap-10">
            {[
              { label: "Logic", id: "how-it-works" },
              { label: "Engine", id: "features" },
              { label: "Security", id: "security" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* CTA Area */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login")}
              className="hidden sm:flex items-center gap-2.5 px-6 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
            >
              <Github size={14} strokeWidth={3} />
              <span>Auth Git</span>
            </motion.button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Sidebar - Better than a floating menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-3/4 max-w-xs bg-white z-50 md:hidden p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="font-black text-xl tracking-tighter">
                  DAEMONDOC
                </span>
                <X
                  onClick={() => setMobileMenuOpen(false)}
                  className="cursor-pointer"
                />
              </div>
              <div className="space-y-2 flex-1">
                {[
                  { label: "Logic", id: "how-it-works" },
                  { label: "Engine", id: "features" },
                  { label: "Security", id: "security" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="w-full text-left py-4 px-4 rounded-lg text-2xl font-black tracking-tighter text-slate-900 hover:bg-slate-100 hover:text-slate-600 transition-all"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
              >
                <Github size={18} />
                Connect GitHub
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingNavigation;
