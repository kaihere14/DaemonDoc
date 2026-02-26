import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";

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
      <>
        <SEO
          title="Login - DaemonDoc | Connect Your GitHub Account"
          description="Sign in to DaemonDoc with your GitHub account to start automating your repository documentation with AI-powered README generation."
          ogUrl="https://daemondoc.online/login"
          canonical="https://daemondoc.online/login"
        />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-[#1d4ed8] rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Login - DaemonDoc | Connect Your GitHub Account"
        description="Sign in to DaemonDoc with your GitHub account to start automating your repository documentation with AI-powered README generation."
        ogUrl="https://daemondoc.online/login"
        canonical="https://daemondoc.online/login"
      />

      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
            {/* Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 p-8 space-y-7">

              {/* Logo + headline */}
              <div className="text-center space-y-3">
                <a href="/">
                  <img
                    src="/DaemonLogo.png"
                    alt="DaemonDoc"
                    className="w-52 mx-auto"
                  />
                </a>
                <div>
                  <h1
                    className="text-2xl font-bold text-slate-900"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Welcome back
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Connect your GitHub to automate your docs
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-xs text-slate-400 font-medium tracking-wide uppercase">
                    Continue with
                  </span>
                </div>
              </div>

              {/* GitHub button */}
              <button
                onClick={handleGitHubLogin}
                className="w-full bg-[#24292e] hover:bg-[#1a1e22] text-white font-semibold py-3.5 px-4 rounded-full transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/25 hover:scale-[1.01] cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Continue with GitHub</span>
              </button>

              {/* Terms */}
              <p className="text-center text-xs text-slate-400">
                By continuing, you agree to our{" "}
                <a
                  href="#"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
      </div>
    </>
  );
};

export default Login;
