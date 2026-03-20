import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";
import { Github, ArrowLeft, Star } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleGitHubLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/github`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-dvh w-full bg-white flex flex-col md:flex-row overflow-hidden relative selection:bg-primary selection:text-white font-sans">
      <SEO
        title="Login - DaemonDoc | Connect Your GitHub Account"
        description="Sign in to DaemonDoc with your GitHub account to start automating your repository documentation with AI-powered README generation."
        ogUrl="https://daemondoc.online/login"
        canonical="https://daemondoc.online/login"
      />

      {/* Subtle landing-page style blobs, much lower opacity */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-100/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Left Navigation Bar */}
      <div className="absolute top-0 left-0 w-full p-4 lg:p-6 flex justify-between items-center z-50 pointer-events-none">
        <a href="/" className="pointer-events-auto">
          <img 
            src="/DaemonLogo.png" 
            alt="DaemonDoc" 
            className="h-12 lg:h-16 w-auto scale-300 pl-3 sm:scale-190 sm:pl-9" 
          />
        </a>
        <button
          onClick={() => navigate("/")}
          className="pointer-events-auto flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to site
        </button>
      </div>

      {/* Auth Side (Split 45/55) */}
      <div className="w-full md:w-[45%] lg:w-[40%] h-full flex flex-col justify-center px-10 lg:px-24 bg-white relative">
        <div className="max-w-sm w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Secure Authentication
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter text-slate-900 mb-6 font-display">
            Welcome.
          </h1>
          <p className="text-slate-500 mb-12 text-xl leading-relaxed font-sans font-medium">
            Documentation is the silent killer of productivity. We fixed that.
          </p>

          <button
            onClick={handleGitHubLogin}
            className="w-full h-18 text-shadow-md drop-shadow-2xl rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold transition-all duration-300 flex items-center justify-center gap-4 group shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30  cursor-pointer"
          >
            <Github size={24}  />
            <span className="text-xl font-display tracking-tight">Continue with GitHub</span>
          </button>

          <p className="mt-8 text-[11px] text-slate-400 font-bold uppercase tracking-[0.25em] leading-relaxed">
            SYNC REQUIRES READ & WRITE ACCESS. ALWAYS SECURE.
          </p>
        </div>
      </div>

      {/* Visual Side (Split 55/45) */}
      <div className="hidden md:flex flex-1 h-full bg-[#fcfcfd] relative items-center justify-center p-12 lg:p-24 overflow-hidden border-l border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        
        <div className="relative z-10 max-w-xl animate-in fade-in zoom-in-95 duration-1000">
          {/* Testimonial Card with Landing Page Dashed-Border and Primary Accents */}
          <div className="bg-white/80 backdrop-blur-md p-12 lg:p-16 rounded-[48px] shadow-[0_32px_64px_-16px_rgba(29,78,216,0.08)] border-2 border-dashed border-slate-200 relative group">
            {/* Primary Accent Stripe - Matching Landing workflow step cards */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-primary rounded-b-full shadow-[0_0_20px_rgba(29,78,216,0.3)]" />
            
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-12 leading-[1.1] font-display tracking-tight">
              "Finally, I can focus on building instead of writing docs."
            </h2>
            
            <div className="flex items-center gap-5 pt-8 border-t border-slate-50">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/10 shadow-md">
                <img src="https://i.pravatar.cc/150?u=48" alt="Developer" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-lg">Alex Rivers</div>
                <div className="text-sm text-primary font-bold tracking-tight uppercase">Lead Engineer @ TechFlow</div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 flex justify-center gap-10 text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60">
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary" /> SOC2 Ready</span>
            <span className="text-slate-200">•</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary" /> AES-256</span>
            <span className="text-slate-200">•</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary" /> GDPR Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
