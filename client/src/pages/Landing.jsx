import React, { useEffect } from "react";
import LandingNavigation from "../components/LandingNavigation";
import Hero from "../components/Hero";
import PainPoints from "../components/PainPoints";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import SecurityBanner from "../components/SecurityBanner";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const LandingPage = () => {
  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <>
      <SEO 
        title="DaemonDoc - AI-Powered README Generator for GitHub | Automate Your Documentation"
        description="Stop wasting hours on documentation. DaemonDoc automatically generates and updates your GitHub README files using AI. Connect your repos and keep documentation fresh as your code evolves."
        keywords="README generator, AI documentation, GitHub automation, automatic README, documentation tool, code documentation, GitHub README, AI README generator, developer tools"
        ogUrl="https://daemondoc.online/"
        canonical="https://daemondoc.online/"
      />
      <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-200 overflow-x-hidden antialiased relative">
        <LandingNavigation />
        <Hero />
        <PainPoints />
        <HowItWorks />
        <Features />
        <SecurityBanner />
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
