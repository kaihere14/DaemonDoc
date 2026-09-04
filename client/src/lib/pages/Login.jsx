import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import { ThinkingOrb } from "@/components/ui/thinking-orb";
import { Github } from "lucide-react";

import { MARKETING_URL } from "../urls";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/* ── Type roles ────────────────────────────────────────────────────────────────
   A closed set of roles, not arbitrary sizes. Every peer that plays the same
   part on the page renders through the same entry here, so equivalent items
   always share size, weight, line-height and numeric treatment. Faces come from
   the site's own stack (Inter Display for text, the UI mono for identifiers)
   rather than a second type system layered on top of it.

   The scale is deliberately one step down from a marketing page: this page has
   to resolve inside a single laptop viewport without scrolling, and density is
   bought by tightening the rhythm rather than by shrinking body copy below the
   14px that keeps it readable. */
const TYPE = {
  title:
    "font-display text-[1.75rem] leading-[1.1] font-semibold text-slate-900 sm:text-[2rem]",
  heading16: "text-[0.9375rem] leading-snug font-semibold text-slate-900",
  lede: "text-[0.9375rem] leading-[1.55] text-slate-600",
  body: "text-sm leading-[1.55] text-slate-600",
  label: "text-sm leading-5 font-medium text-slate-900",
  caption: "text-[0.8125rem] leading-[1.5] text-slate-500",
  metadata: "text-[0.8125rem] leading-5 text-slate-400 tabular-nums",
  mono: "font-mono text-[0.8125rem] leading-5 tracking-normal text-slate-500",
};

/* ── The pipeline ──────────────────────────────────────────────────────────────
   The five stages a push moves through, as readable evidence rather than a
   five-screen slideshow. Nothing here is gated behind an animation or a Next
   button: the whole sequence is on the page at once, next to the one action the
   page exists for. `id` values are the real operational identifiers, so they
   render in mono; prose renders in the body face and stays to one line at the
   column width so five stages fit the viewport together. */
const PIPELINE = [
  {
    step: "01",
    label: "Push",
    detail: "You commit and push to your default branch.",
    id: "git push origin main",
  },
  {
    step: "02",
    label: "Webhook",
    detail: "GitHub delivers the event. No polling interval to wait out.",
    id: "POST /webhooks/github",
  },
  {
    step: "03",
    label: "Fetch",
    detail: "The current snapshot, including every file the push touched.",
    id: "src/, package.json",
  },
  {
    step: "04",
    label: "Analyze",
    detail: "New repository: read in full. Update: only what changed.",
    id: "src/index.ts, src/middleware/auth.ts",
  },
  {
    step: "05",
    label: "Commit",
    detail: "The README is written back. You never write documentation.",
    id: "chore: update README via DaemonDoc",
  },
];

/* What connecting actually grants and produces. Three true peers: same label
   lane, same value lane, so they compare straight down the column. */
const ACCESS = [
  { label: "Scope requested", value: "repo" },
  { label: "File written", value: "README.md" },
  { label: "Revocation", value: "github.com/settings/applications" },
];

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate("/home");
  }, [isAuthenticated, isLoading, navigate]);

  // Navigate from an effect rather than inside the click handler: effects run
  // after the commit paints, so the button's redirecting state is actually seen
  // before the browser leaves the page.
  useEffect(() => {
    if (isRedirecting) window.location.href = `${BACKEND_URL}/auth/github`;
  }, [isRedirecting]);

  const handleGitHubLogin = useCallback(() => setIsRedirecting(true), []);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <ThinkingOrb preset="searching" label="Checking your session" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white font-sans text-slate-900">
      <a
        href="#main"
        className="sr-only rounded-md px-3 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-slate-900"
      >
        Skip to content
      </a>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 sm:px-8">
        {/* ── Masthead. Identity left, one field right, separated by space
            rather than a rule. ───────────────────────────────────────────── */}
        <header className="flex shrink-0 items-center justify-between gap-6 py-5">
          <a
            href={MARKETING_URL}
            aria-label="DaemonDoc home"
            className="rounded-md"
          >
            <img
              src="/DaemonLogo-nav.png"
              alt="DaemonDoc"
              width={406}
              height={120}
              className="h-6 w-auto"
            />
          </a>
          <a
            href={MARKETING_URL}
            className={`${TYPE.caption} rounded-md text-slate-500 transition-colors hover:text-slate-900`}
          >
            Back to daemondoc.online
          </a>
        </header>

        <main
          id="main"
          className="grid flex-1 grid-cols-1 content-center gap-x-10 gap-y-10 py-6 lg:grid-cols-12 lg:gap-y-0"
        >
          {/* ── The action. Dominant in the first viewport, because signing in
              is the reader's whole job here. ───────────────────────────────── */}
          <section className="min-w-0 lg:col-span-5">
            <h1 className={TYPE.title}>Sign in to DaemonDoc</h1>
            <p className={`${TYPE.lede} mt-3 max-w-[58ch]`}>
              DaemonDoc reads your repository on every push and writes the
              documentation back to it.
            </p>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGitHubLogin}
                disabled={isRedirecting}
                className="bg-primary hover:bg-primary/90 inline-flex h-11 w-full max-w-xs cursor-pointer items-center justify-center gap-2.5 rounded-lg px-6 text-[0.9375rem] font-medium text-white transition-colors disabled:cursor-default disabled:opacity-70"
              >
                <Github size={17} aria-hidden="true" />
                {isRedirecting
                  ? "Redirecting to GitHub"
                  : "Continue with GitHub"}
              </button>
              <p
                role="status"
                aria-live="polite"
                className={`${TYPE.caption} mt-2.5 max-w-xs`}
              >
                {isRedirecting
                  ? "Taking you to GitHub to authorize DaemonDoc."
                  : "GitHub OAuth. DaemonDoc never sees your password."}
              </p>
            </div>

            {/* Label lane, value lane. Identical across all three rows. */}
            <section className="mt-8 border-t border-slate-200 pt-5">
              <h2 className={TYPE.heading16}>What connecting grants</h2>
              <dl className="mt-3 grid gap-1.5">
                {ACCESS.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[9rem_minmax(0,1fr)] gap-x-3"
                  >
                    <dt className={TYPE.caption}>{item.label}</dt>
                    <dd className={`${TYPE.mono} truncate`}>{item.value}</dd>
                  </div>
                ))}
              </dl>
              <p className={`${TYPE.caption} mt-3 max-w-[52ch]`}>
                Revoke access at any time and generation stops immediately.
              </p>
            </section>
          </section>

          {/* ── The evidence. Still: no autoplay, no reveal on scroll, no
              simulated terminal. The sequence reads at a glance. ──────────── */}
          <section className="min-w-0 lg:col-span-6 lg:col-start-7 lg:border-l lg:border-slate-200 lg:pl-10">
            <h2 className={TYPE.heading16}>How a push becomes documentation</h2>

            <ol className="mt-4">
              {PIPELINE.map((stage, i) => (
                <li
                  key={stage.step}
                  className={`grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 py-3 ${
                    i > 0 ? "border-t border-slate-100" : "pt-0"
                  }`}
                >
                  <span className={TYPE.metadata} aria-hidden="true">
                    {stage.step}
                  </span>
                  <div className="grid min-w-0 gap-0.5">
                    <h3 className={TYPE.label}>{stage.label}</h3>
                    <p className={TYPE.body}>{stage.detail}</p>
                    <p className={`${TYPE.mono} truncate`}>{stage.id}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </main>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4">
          <span className={TYPE.caption}>DaemonDoc</span>
          <span className={TYPE.caption}>
            Documentation generated from your commits.
          </span>
        </footer>
      </div>
    </div>
  );
};

export default Login;
