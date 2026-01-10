import React, { useEffect } from "react";
import LandingNavigation from "../components/LandingNavigation";
import Hero from "../components/Hero";
import PainPoints from "../components/PainPoints";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import SecurityBanner from "../components/SecurityBanner";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";

const LandingPage = () => {
  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-200 overflow-x-hidden antialiased">
      <LandingNavigation />
      <Hero />
      <PainPoints />
      <HowItWorks />
      <Features />
      <SecurityBanner />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
