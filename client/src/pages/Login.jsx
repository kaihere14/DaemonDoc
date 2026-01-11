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
    // Redirect to GitHub OAuth
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                <img src="/logo.svg" alt="DaemonDoc Logo" className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to DaemonDoc
            </h1>
            <p className="text-gray-500 text-sm">
              Sign in to continue to your account
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Continue with</span>
            </div>
          </div>

          {/* GitHub Login Button */}
          <button
            onClick={handleGitHubLogin}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            <span>Continue with GitHub</span>
          </button>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-4">
            <p>By continuing, you agree to our</p>
            <div className="flex justify-center space-x-2 mt-1">
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Terms of Service
              </a>
              <span>•</span>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="#" className="text-gray-900 font-semibold hover:underline">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;
