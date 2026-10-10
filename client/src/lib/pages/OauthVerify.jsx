import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import { usePostHog } from "@posthog/react";
import VerifyCard from "@/components/auth/VerifyCard";

const OauthVerify = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const { login } = useAuth();
  const posthog = usePostHog();

  useEffect(() => {
    const verifyToken = async () => {
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
          posthog?.identify(result.user.githubUsername, {
            email: result.user.email,
            name: result.user.name,
          });
          posthog?.capture("user_logged_in");
          setStatus("success");
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
        posthog?.captureException(error);
        setStatus("error");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    };

    verifyToken();
  }, [navigate, login, posthog]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-white via-slate-50/70 to-white p-4 font-sans text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-24 left-[-8rem] h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute right-[-7rem] bottom-24 h-80 w-80 rounded-full bg-sky-100/45 blur-3xl" />
      </div>

      <VerifyCard status={status} />
    </div>
  );
};

export default OauthVerify;
