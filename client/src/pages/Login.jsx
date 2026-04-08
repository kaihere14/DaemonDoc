import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Seo from "../components/SEO";
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="border-t-primary h-10 w-10 animate-spin rounded-full border-4 border-slate-100" />
      </div>
    );
  }

  return (
    <div className="selection:bg-primary relative mx-auto flex h-dvh flex-col overflow-hidden bg-white font-sans selection:text-white md:max-w-600 md:flex-row 2xl:max-w-300">
      <Seo
        title="Login - DaemonDoc | Connect Your GitHub Account"
        description="Sign in to DaemonDoc with your GitHub account to start automating your repository documentation with AI-powered README generation."
        ogUrl="https://daemondoc.online/login"
        canonical="https://daemondoc.online/login"
      />

      <div className="bg-primary/5 pointer-events-none absolute top-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-20%] h-[50%] w-[50%] rounded-full bg-blue-100/10 blur-[160px]" />

      <div className="pointer-events-none absolute top-0 left-0 z-50 flex w-full items-center justify-between p-4 lg:p-6">
        <a href="/" className="pointer-events-auto">
          <img
            src="/DaemonLogo.png"
            alt="DaemonDoc"
            className="h-12 w-auto scale-300 pl-3 sm:scale-190 sm:pl-9 lg:h-16"
          />
        </a>
        <button
          onClick={() => navigate("/")}
          className="hover:text-primary group pointer-events-auto flex cursor-pointer items-center gap-2 text-xs font-bold tracking-widest text-slate-400 uppercase transition-colors"
        >
          <ArrowLeft
            size={20}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to site
        </button>
      </div>

      <div className="relative flex h-full w-full flex-col justify-center bg-white px-10 md:w-[45%] lg:w-[40%] lg:px-24">
        <div className="animate-in fade-in slide-in-from-bottom-6 w-full max-w-sm duration-700">
          <div className="bg-primary/10 text-primary border-primary/20 mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
            <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
            Secure Authentication
          </div>

          <h1 className="font-display mb-6 text-5xl font-bold tracking-tighter text-slate-900 lg:text-7xl">
            Welcome.
          </h1>
          <p className="mb-12 font-sans text-xl leading-relaxed font-medium text-slate-500">
            Documentation is the silent killer of productivity. We fixed that.
          </p>

          <button
            onClick={handleGitHubLogin}
            className="bg-primary hover:bg-primary/95 group shadow-primary/20 hover:shadow-primary/30 flex h-18 w-full cursor-pointer items-center justify-center gap-4 rounded-2xl font-bold text-white shadow-xl drop-shadow-2xl transition-all duration-300 text-shadow-md hover:shadow-2xl"
          >
            <Github size={24} />
            <span className="font-display text-xl tracking-tight">
              Continue with GitHub
            </span>
          </button>

          <p className="mt-8 text-[11px] leading-relaxed font-bold tracking-[0.25em] text-slate-400 uppercase">
            SYNC REQUIRES READ & WRITE ACCESS. ALWAYS SECURE.
          </p>
        </div>
      </div>

      <div className="relative hidden h-full flex-1 items-center justify-center overflow-hidden border-l border-slate-100 bg-[#fcfcfd] p-12 md:flex lg:p-24">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

        <div className="animate-in fade-in zoom-in-95 relative z-10 max-w-xl duration-1000">
          <div className="group relative rounded-[48px] border-2 border-dashed border-slate-200 bg-white/80 p-12 shadow-[0_32px_64px_-16px_rgba(29,78,216,0.08)] backdrop-blur-md lg:p-16">
            <div className="bg-primary absolute top-0 left-1/2 h-1 w-48 -translate-x-1/2 rounded-b-full shadow-[0_0_20px_rgba(29,78,216,0.3)]" />

            <h2 className="font-display mb-12 text-3xl leading-[1.1] font-bold tracking-tight text-slate-900 lg:text-5xl">
              "Finally, I can focus on building instead of writing docs."
            </h2>

            <div className="flex items-center gap-5 border-t border-slate-50 pt-8">
              <div className="border-primary/10 h-14 w-14 overflow-hidden rounded-full border-2 shadow-md">
                <img
                  src="https://i.pravatar.cc/150?u=48"
                  alt="Developer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">
                  Alex Rivers
                </div>
                <div className="text-primary text-sm font-bold tracking-tight uppercase">
                  Lead Engineer @ TechFlow
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex justify-center gap-10 text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase opacity-60">
            <span className="flex items-center gap-2">
              <div className="bg-primary h-1 w-1 rounded-full" /> SOC2 Ready
            </span>
            <span className="text-slate-200">•</span>
            <span className="flex items-center gap-2">
              <div className="bg-primary h-1 w-1 rounded-full" /> AES-256
            </span>
            <span className="text-slate-200">•</span>
            <span className="flex items-center gap-2">
              <div className="bg-primary h-1 w-1 rounded-full" /> GDPR Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
