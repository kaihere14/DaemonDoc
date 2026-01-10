import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OauthVerify = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const { login } = useAuth();

  useEffect(() => {
    const verifyToken = async () => {
      // Extract the access token from the URL hash
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("accessToken");

      if (!accessToken) {
        setStatus("error");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      try {
        const result = await login(accessToken);

        if (result.success) {
          setStatus("success");
          // Redirect to home page after a brief delay
          setTimeout(() => {
            navigate("/home");
          }, 1500);
        } else {
          setStatus("error");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    };

    verifyToken();
  }, [navigate, login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === "verifying" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verifying...</h2>
            <p className="text-gray-500">
              Please wait while we authenticate your account
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
            <p className="text-gray-500">
              You've been authenticated successfully
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Authentication Failed
            </h2>
            <p className="text-gray-500">Redirecting to login page...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OauthVerify;
