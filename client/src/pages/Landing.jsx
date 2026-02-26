import React, { useEffect } from "react";
import LandingNavigation from "../components/LandingNavigation";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const LandingPage = () => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
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
      <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 overflow-x-hidden antialiased">
        <LandingNavigation />
        <Hero />
        <Features />
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
