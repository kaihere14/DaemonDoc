import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Github,
  ArrowLeft,
  ArrowRight,
  FolderSearch,
  CheckCheck,
  CheckCircle,
  Zap,
  RotateCcw,
  Terminal,
  Bot,
  Upload,
  Folder,
  FileCode,
  FileText,
  Package,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const README_CONTENT = `# MyProject

A high-performance REST API built with
Node.js and TypeScript.

## Features
- ✅ OAuth 2.0 via GitHub
- ✅ Rate limiting & Redis cache
- ✅ Docker ready
- ✅ Auto-generated docs

## Quick Start
\`npm install && npm run dev\`

## API Endpoints
POST /auth/github
GET  /api/user
DELETE /api/user/:id`;

const FETCH_FILES = [
  { name: "src/", Icon: Folder, size: "12 files" },
  { name: "package.json", Icon: FileCode, size: "2.1 kb" },
  { name: "tsconfig.json", Icon: FileCode, size: "0.8 kb" },
  { name: "README.md", Icon: FileText, size: "3.4 kb", isTarget: true },
  { name: "docker-compose.yml", Icon: Package, size: "1.2 kb" },
];

const SCAN_FILES = [
  { path: "src/index.ts", tag: "entry", variant: "green" },
  { path: "src/routes/", tag: "scanned", variant: "blue" },
  { path: "src/middleware/auth.ts", tag: "changed", variant: "primary" },
  { path: "src/models/", tag: "scanned", variant: "blue" },
  { path: "README.md", tag: "output", variant: "orange" },
];

// ─── Layout shells — defined OUTSIDE Login so React never remounts them ────────

const Shell = ({ step, setStep, nav, children }) => (
  <div className="selection:bg-primary relative mx-auto flex min-h-dvh flex-col overflow-x-hidden bg-white font-sans selection:text-white md:h-dvh md:max-w-600 md:flex-row md:overflow-hidden 2xl:max-w-300">
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
        onClick={() => (step > 0 ? setStep((s) => s - 1) : nav("/"))}
        className="hover:text-primary group pointer-events-auto flex cursor-pointer items-center gap-2 text-xs font-bold tracking-widest text-slate-400 uppercase transition-colors"
      >
        <ArrowLeft
          size={20}
          className="transition-transform group-hover:-translate-x-1"
        />
        {step > 0 ? "Back" : "Back to site"}
      </button>
    </div>
    {children}
  </div>
);

const RightShell = ({ children }) => (
  <div className="relative order-1 flex h-[50vh] shrink-0 items-center justify-center overflow-hidden border-b border-slate-100 bg-[#fcfcfd] px-4 pt-16 pb-4 md:order-2 md:h-full md:flex-1 md:shrink md:border-b-0 md:border-l md:p-20">
    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
    <div className="relative z-10 w-full max-w-sm overflow-y-auto md:max-w-md md:overflow-visible">
      <div className="relative rounded-3xl border-2 border-dashed border-slate-200 bg-white/80 p-5 shadow-[0_32px_64px_-16px_rgba(29,78,216,0.08)] backdrop-blur-md md:rounded-[40px] md:p-8">
        <div className="bg-primary absolute top-0 left-1/2 h-1 w-24 -translate-x-1/2 rounded-b-full shadow-[0_0_20px_rgba(29,78,216,0.3)] md:w-32" />
        {children}
      </div>
    </div>
  </div>
);

const ProgressDots = ({ step }) => (
  <div className="mb-5 flex gap-2 md:mb-8">
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-500 ${
          i === step
            ? "bg-primary w-6"
            : i < step
              ? "bg-primary/40 w-3"
              : "w-3 bg-slate-200"
        }`}
      />
    ))}
  </div>
);

// key={step} on the inner div — re-animates on step change, stays still on per-step state changes
const OnboardingLeft = ({ step, badge, headline, sub, onNext, isLast }) => (
  <div className="relative order-2 flex w-full flex-col justify-center bg-white px-6 py-10 md:order-1 md:h-full md:w-[45%] md:px-10 lg:w-[40%] lg:px-24">
    <div
      key={step}
      className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-sm duration-500"
    >
      <ProgressDots step={step} />
      <div className="bg-primary/10 text-primary border-primary/20 mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
        <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
        {badge}
      </div>
      <h1 className="font-display mb-3 text-3xl font-bold tracking-tighter text-slate-900 md:mb-4 md:text-4xl lg:text-5xl">
        {headline}
      </h1>
      <p className="mb-8 font-sans text-base leading-relaxed font-medium text-slate-500 md:text-lg">
        {sub}
      </p>
      <button
        onClick={onNext}
        className="bg-primary hover:bg-primary/90 group shadow-primary/20 flex h-13 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl font-bold text-white shadow-lg transition-all duration-300 md:h-14"
      >
        <span className="font-display text-base tracking-tight md:text-lg">
          {isLast ? "Connect GitHub" : "Next"}
        </span>
        <ArrowRight
          size={18}
          className="transition-transform group-hover:translate-x-1"
        />
      </button>
      <p className="mt-4 text-[10px] font-bold tracking-[0.2em] text-slate-300 uppercase">
        Step {step + 1} of 5 — How DaemonDoc works
      </p>
    </div>
  </div>
);

const ReplayBtn = ({ onClick, running, idleLabel = "Run again" }) => (
  <button
    onClick={onClick}
    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-400 transition hover:border-slate-300 hover:text-slate-600"
  >
    {running ? (
      <>
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        Running...
      </>
    ) : (
      <>
        <RotateCcw size={11} /> {idleLabel}
      </>
    )}
  </button>
);

// ─── Login ─────────────────────────────────────────────────────────────────────

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState(0);

  // playKey increments to replay the current step's animation
  const [playKey, setPlayKey] = useState(0);
  const replay = useCallback(() => setPlayKey((k) => k + 1), []);

  // Step 0 — commit simulator
  const [commitMsg, setCommitMsg] = useState("feat: add OAuth login");
  const [commitStage, setCommitStage] = useState("idle");

  // Step 1 — webhook pipeline
  const [pipelineStage, setPipelineStage] = useState(0);

  // Step 2 — file fetch
  const [fetchedCount, setFetchedCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  // Step 3 — folder scanner
  const [scannedCount, setScannedCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isNewRepo, setIsNewRepo] = useState(true);

  // Step 4 — README typewriter
  const [readmeText, setReadmeText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [readmeDone, setReadmeDone] = useState(false);
  const typewriterRef = useRef(null);
  const readmeScrollRef = useRef(null);

  const handleNext = useCallback(() => setStep((s) => s + 1), []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate("/home");
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => () => clearTimeout(typewriterRef.current), []);

  useEffect(() => {
    if (readmeScrollRef.current)
      readmeScrollRef.current.scrollTop = readmeScrollRef.current.scrollHeight;
  }, [readmeText]);

  // Auto-play each step's animation. Replays when step changes or playKey increments.
  useEffect(() => {
    const d = 550; // lead-in delay after step transition animation
    const timers = [];

    if (step === 0) {
      setCommitStage("idle");
      timers.push(setTimeout(() => setCommitStage("pushing"), d));
      timers.push(setTimeout(() => setCommitStage("webhook"), d + 1200));
      timers.push(setTimeout(() => setCommitStage("processing"), d + 2200));
      timers.push(setTimeout(() => setCommitStage("done"), d + 3800));
    }

    if (step === 1) {
      setPipelineStage(0);
      timers.push(setTimeout(() => setPipelineStage(1), d));
      timers.push(setTimeout(() => setPipelineStage(2), d + 900));
      timers.push(setTimeout(() => setPipelineStage(3), d + 1800));
    }

    if (step === 2) {
      setFetchedCount(0);
      setIsFetching(true);
      FETCH_FILES.forEach((_, i) =>
        timers.push(
          setTimeout(
            () => {
              setFetchedCount(i + 1);
              if (i === FETCH_FILES.length - 1) setIsFetching(false);
            },
            d + (i + 1) * 500,
          ),
        ),
      );
    }

    if (step === 3) {
      setScannedCount(0);
      setIsScanning(true);
      SCAN_FILES.forEach((_, i) =>
        timers.push(
          setTimeout(
            () => {
              setScannedCount(i + 1);
              if (i === SCAN_FILES.length - 1) setIsScanning(false);
            },
            d + (i + 1) * 450,
          ),
        ),
      );
    }

    if (step === 4) {
      clearTimeout(typewriterRef.current);
      setReadmeText("");
      setReadmeDone(false);
      setIsGenerating(false);
      const startT = setTimeout(() => {
        setIsGenerating(true);
        let i = 0;
        const type = () => {
          if (i < README_CONTENT.length) {
            setReadmeText(README_CONTENT.slice(0, i + 1));
            i++;
            typewriterRef.current = setTimeout(type, 22);
          } else {
            setIsGenerating(false);
            setReadmeDone(true);
          }
        };
        typewriterRef.current = setTimeout(type, 0);
      }, d);
      timers.push(startT);
    }

    return () => {
      timers.forEach(clearTimeout);
      if (step === 4) clearTimeout(typewriterRef.current);
    };
  }, [step, playKey]);

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

  // ─── Step 0: Commit initial step ───────────────────────────────
  // Editable terminal + pipeline stages animate automatically.
  // Clicking push replays from the current commit message.
  if (step === 0) {
    const STAGES = [
      {
        key: "pushing",
        label: "Pushing to GitHub...",
        Icon: Upload,
        color: "text-blue-600",
      },
      {
        key: "webhook",
        label: "Webhook fired",
        Icon: Zap,
        color: "text-yellow-600",
      },
      {
        key: "processing",
        label: "DaemonDoc processing...",
        Icon: Bot,
        color: "text-primary",
      },
      {
        key: "done",
        label: "README.md committed",
        Icon: CheckCircle,
        color: "text-emerald-600",
      },
    ];
    const reachedIdx = STAGES.findIndex((s) => s.key === commitStage);
    const isRunning = ["pushing", "webhook", "processing"].includes(
      commitStage,
    );

    return (
      <Shell step={step} setStep={setStep} nav={navigate}>
        <OnboardingLeft
          step={step}
          badge="How it works"
          headline="Docs written by your commits."
          sub="DaemonDoc hooks into your GitHub workflow. Every push triggers an AI pipeline that reads your code and writes your README — automatically."
          onNext={handleNext}
        />
        <RightShell>
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-900 p-4 font-mono text-sm">
              <div className="mb-3 flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <p className="text-[11px] text-slate-500">$ git commit -m</p>
              <input
                type="text"
                value={`"${commitMsg}"`}
                onChange={(e) =>
                  setCommitMsg(e.target.value.replace(/^"|"$/g, ""))
                }
                className="mt-1 w-full bg-transparent font-mono text-sm text-green-400 caret-green-400 outline-none"
                spellCheck={false}
              />
              <button
                onClick={replay}
                className="mt-3 w-full cursor-pointer rounded-lg bg-white/5 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/10"
              >
                {isRunning ? "$ running... ↵" : "$ git push origin main ↵"}
              </button>
            </div>

            <div className="space-y-2">
              {STAGES.map((s, i) => {
                const reached = reachedIdx >= i;
                const active = reachedIdx === i && commitStage !== "done";
                return (
                  <div
                    key={s.key}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-500 ${
                      reached
                        ? "bg-slate-50 opacity-100"
                        : "bg-slate-50/40 opacity-20"
                    }`}
                  >
                    <s.Icon
                      size={15}
                      className={reached ? s.color : "text-slate-300"}
                    />
                    <span className={reached ? s.color : "text-slate-400"}>
                      {s.label}
                    </span>
                    {active && (
                      <div className="ml-auto h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
                    )}
                    {reached && !active && (
                      <div
                        className={`ml-auto h-2 w-2 rounded-full ${s.key === "done" ? "bg-emerald-400" : "bg-slate-300"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </RightShell>
      </Shell>
    );
  }

  // ─── Step 1: Webhook trigger ────────────────────────────────────
  // Three nodes light up in sequence automatically.
  // Replay button re-runs the flow from the start.
  if (step === 1) {
    const NODES = [
      {
        label: "GitHub",
        sub: "push event",
        icon: <Github size={20} />,
        on: "border-slate-800 bg-slate-900 text-white",
        off: "border-slate-200 bg-slate-50 text-slate-400",
      },
      {
        label: "Webhook",
        sub: "POST fired",
        icon: <Zap size={20} />,
        on: "border-yellow-400 bg-yellow-50 text-yellow-600",
        off: "border-slate-200 bg-slate-50 text-slate-400",
      },
      {
        label: "DaemonDoc",
        sub: "pipeline runs",
        icon: <Bot size={20} />,
        on: "border-primary bg-primary/5 text-primary",
        off: "border-slate-200 bg-slate-50 text-slate-400",
      },
    ];
    const isRunning = pipelineStage > 0 && pipelineStage < 3;

    return (
      <Shell step={step} setStep={setStep} nav={navigate}>
        <OnboardingLeft
          step={step}
          badge="Trigger"
          headline="You push. We wake up instantly."
          sub="GitHub sends a webhook the moment you push. DaemonDoc listens 24/7 — no polling, no delays. Your commit is the trigger."
          onNext={handleNext}
        />
        <RightShell>
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              {NODES.map((node, i) => {
                const active = pipelineStage > i;
                return (
                  <React.Fragment key={node.label}>
                    <div
                      className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center transition-all duration-500 ${
                        active ? node.on : node.off
                      }`}
                    >
                      <div
                        className={`transition-transform duration-500 ${active ? "scale-110" : ""}`}
                      >
                        {node.icon}
                      </div>
                      <p className="text-[11px] leading-tight font-bold">
                        {node.label}
                      </p>
                      <p
                        className={`text-[9px] ${active ? "opacity-70" : "opacity-40"}`}
                      >
                        {node.sub}
                      </p>
                    </div>
                    {i < NODES.length - 1 && (
                      <div className="relative h-0.5 w-6 flex-shrink-0 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`bg-primary absolute inset-0 rounded-full transition-transform duration-700 ${
                            pipelineStage > i + 1
                              ? "translate-x-0"
                              : "-translate-x-full"
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div
              className={`rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center transition-all duration-700 ${
                pipelineStage === 3 ? "opacity-100" : "opacity-0"
              }`}
            >
              <p className="text-xs font-bold text-emerald-700">
                Pipeline triggered · &lt;10ms latency
              </p>
              <p className="mt-0.5 text-[10px] text-emerald-600">
                No polling. Pure event-driven.
              </p>
            </div>

            <ReplayBtn onClick={replay} running={isRunning} />
          </div>
        </RightShell>
      </Shell>
    );
  }

  // ─── Step 2: Repo fetch ─────────────────────────────────────────
  // Files reveal with checkmarks automatically. Progress bar tracks it.
  if (step === 2) {
    const progress = Math.round((fetchedCount / FETCH_FILES.length) * 100);
    const fetchDone = fetchedCount === FETCH_FILES.length && !isFetching;

    return (
      <Shell step={step} setStep={setStep} nav={navigate}>
        <OnboardingLeft
          step={step}
          badge="Fetch"
          headline="We pull your entire codebase."
          sub="DaemonDoc fetches the latest snapshot of your repository — every changed file — and feeds it into the AI pipeline for analysis."
          onNext={handleNext}
        />
        <RightShell>
          <div className="space-y-3">
            <div className="space-y-1.5">
              {FETCH_FILES.map((f, i) => {
                const fetched = i < fetchedCount;
                const active = i === fetchedCount && isFetching;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-300 ${
                      fetched
                        ? f.isTarget
                          ? "border-primary/20 bg-primary/5 border"
                          : "bg-slate-50"
                        : active
                          ? "bg-slate-50 opacity-60"
                          : "bg-slate-50/30 opacity-20"
                    }`}
                  >
                    <f.Icon
                      size={15}
                      className={`shrink-0 ${fetched && f.isTarget ? "text-primary" : "text-slate-400"}`}
                    />
                    <span
                      className={`flex-1 font-mono text-xs font-medium ${
                        fetched && f.isTarget
                          ? "text-primary"
                          : "text-slate-700"
                      }`}
                    >
                      {f.name}
                    </span>
                    <span className="text-xs text-slate-400">{f.size}</span>
                    {active && (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
                    )}
                    {fetched && (
                      <CheckCheck
                        size={14}
                        className={
                          f.isTarget ? "text-primary" : "text-emerald-500"
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${fetchDone ? "bg-emerald-500" : "bg-primary"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span
                className={`min-w-[2.5rem] text-right text-xs font-bold ${fetchDone ? "text-emerald-600" : "text-slate-400"}`}
              >
                {progress}%
              </span>
            </div>

            <ReplayBtn
              onClick={replay}
              running={isFetching}
              idleLabel="Fetch again"
            />
          </div>
        </RightShell>
      </Shell>
    );
  }

  // ─── Step 3: Folder scanner ─────────────────────────────────────
  // Toggle mode then watch tags appear automatically.
  // Mode toggle replays the scan with the new mode.
  if (step === 3) {
    const TAG = {
      green: "bg-green-50 border-green-200 text-green-700",
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      primary: "bg-primary/5 border-primary/30 text-primary",
      orange: "bg-orange-50 border-orange-200 text-orange-700",
    };

    const switchMode = (val) => {
      setIsNewRepo(val);
      replay();
    };

    return (
      <Shell step={step} setStep={setStep} nav={navigate}>
        <OnboardingLeft
          step={step}
          badge="Analysis"
          headline="Smart. Knows what to read."
          sub="For new repos, the AI scans everything. For updates, only the changed files. Entry points, modules, configs — nothing irrelevant."
          onNext={handleNext}
        />
        <RightShell>
          <div className="space-y-3">
            <div className="mb-1 flex gap-2">
              {[
                { label: "New repo", val: true },
                { label: "Update (diff)", val: false },
              ].map((m) => (
                <button
                  key={String(m.val)}
                  onClick={() => switchMode(m.val)}
                  className={`flex-1 cursor-pointer rounded-xl border py-2.5 text-[11px] font-bold transition ${
                    isNewRepo === m.val
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-slate-200 text-slate-400 hover:border-slate-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              {SCAN_FILES.map((f, i) => {
                const revealed = i < scannedCount;
                const active = i === scannedCount && isScanning;
                const skipped = !isNewRepo && f.tag === "scanned";
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5 shadow-sm transition-all duration-400 ${
                      skipped
                        ? "border-transparent opacity-15"
                        : revealed
                          ? "border-slate-100 opacity-100"
                          : active
                            ? "border-slate-100 opacity-55"
                            : "border-transparent opacity-20"
                    }`}
                  >
                    <FolderSearch
                      size={14}
                      className="shrink-0 text-slate-400"
                    />
                    <span className="flex-1 font-mono text-xs text-slate-700">
                      {f.path}
                    </span>
                    {active && !skipped && (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
                    )}
                    {revealed && !skipped && (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${TAG[f.variant]}`}
                      >
                        {f.tag}
                      </span>
                    )}
                    {skipped && (
                      <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[9px] font-bold tracking-wider text-slate-300 uppercase">
                        skip
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <ReplayBtn
              onClick={replay}
              running={isScanning}
              idleLabel="Scan again"
            />
          </div>
        </RightShell>
      </Shell>
    );
  }

  // ─── Step 4: README generation ──────────────────────────────────
  // Typewriter runs automatically. Replay restarts it from the beginning.
  if (step === 4) {
    return (
      <Shell step={step} setStep={setStep} nav={navigate}>
        <OnboardingLeft
          step={step}
          badge="Generation"
          headline="README written. Committed back."
          sub="AI generates a production-quality README and pushes it directly to your repo. You never write documentation again."
          onNext={handleGitHubLogin}
          isLast
        />
        <RightShell>
          <div className="space-y-4">
            <div
              ref={readmeScrollRef}
              className="h-52 overflow-y-auto scroll-smooth rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed"
            >
              {readmeText ? (
                <pre className="whitespace-pre-wrap text-slate-300">
                  {readmeText}
                  {isGenerating && (
                    <span className="text-primary animate-pulse">█</span>
                  )}
                </pre>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-600">
                  <Terminal size={22} />
                  <p className="text-[11px] leading-relaxed">
                    Generating README...
                  </p>
                </div>
              )}
            </div>

            <div
              className={`flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 transition-all duration-700 ${
                readmeDone ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <CheckCheck size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Committed to main
                </p>
                <p className="font-mono text-[10px] text-slate-500">
                  chore: update README via DaemonDoc
                </p>
              </div>
            </div>

            <ReplayBtn
              onClick={replay}
              running={isGenerating}
              idleLabel="Generate again"
            />
          </div>
        </RightShell>
      </Shell>
    );
  }
};

export default Login;
