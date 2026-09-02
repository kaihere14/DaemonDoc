import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePostHog } from "@posthog/react";
import { ThinkingOrb } from "@/components/ui/thinking-orb";

// Same three-part shape for every state, so the card doesn't jump as the
// status changes — only the mark, the colour and the copy swap.
const STATUS_VIEW = {
  verifying: {
    tone: "border-slate-200 bg-slate-50 text-slate-500",
    title: "Verifying",
    body: "Please wait while we authenticate your account.",
  },
  success: {
    tone: "border-blue-100 bg-blue-50 text-blue-600",
    title: "Success",
    body: "You've been authenticated. Taking you to your dashboard.",
  },
  error: {
    tone: "border-rose-100 bg-rose-50 text-rose-600",
    title: "Authentication failed",
    body: "We couldn't verify this sign-in. Redirecting to login.",
  },
};

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

  const view = STATUS_VIEW[status];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-white via-slate-50/70 to-white p-4 font-sans text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-24 left-[-8rem] h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute right-[-7rem] bottom-24 h-80 w-80 rounded-full bg-sky-100/45 blur-3xl" />
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-panel shadow-raised sm:rounded-panel-lg relative w-full max-w-md border border-slate-200 bg-white/90 p-8 text-center backdrop-blur-sm sm:p-10"
      >
        <div
          className={`rounded-panel mx-auto mb-6 flex h-16 w-16 items-center justify-center border ${view.tone}`}
        >
          {status === "verifying" && (
            <ThinkingOrb
              preset="searching"
              showLabel={false}
              tone="ghost"
              size="sm"
              className="h-auto p-0 text-current [--orb-size:1.75rem]"
            />
          )}
          {status === "success" && <Check size={30} strokeWidth={2.5} />}
          {status === "error" && <X size={30} strokeWidth={2.5} />}
        </div>

        <p className="mb-2 font-mono text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
          GitHub OAuth
        </p>
        <h1 className="mb-3 text-xl font-black tracking-tight text-slate-900 uppercase sm:text-2xl">
          {view.title}
        </h1>
        <p className="text-sm leading-relaxed text-slate-500">{view.body}</p>
      </div>
    </div>
  );
};

export default OauthVerify;
