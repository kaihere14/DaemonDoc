import React from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Github } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingNavigation = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = React.useState(true);
  const [hasScrolled, setHasScrolled] = React.useState(false);
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
    } else {
      setIsVisible(true);
    }
    
    lastScrollY.current = latest;
  });

  const scrollToSection = (sectionId) => {
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
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        hasScrolled 
          ? "w-[calc(100%-3rem)] max-w-5xl" 
          : "w-[calc(100%-3rem)] max-w-6xl"
      }`}
    >
      <div 
        className={`
          relative overflow-hidden rounded-2xl border transition-all duration-500
          ${hasScrolled 
            ? "bg-white/80 backdrop-blur-2xl border-slate-200/60 shadow-lg shadow-slate-900/5" 
            : "bg-white/95 backdrop-blur-sm border-slate-200/40 shadow-sm"
          }
        `}
      >
        <div className="px-6 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <motion.div 
              whileHover={{ rotate: 8, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-slate-900 rounded-lg blur-sm opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-slate-900 text-white w-9 h-9 rounded-lg flex items-center justify-center">
                <span className="font-bold text-base">R</span>
              </div>
            </motion.div>
            <span className="font-semibold text-lg tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
              ReadmeAI
            </span>
          </motion.div>

          {/* Navigation Links */}
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
                className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <Github size={15} strokeWidth={2} className="relative z-10" />
              <span className="relative z-10">Connect GitHub</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default LandingNavigation;

