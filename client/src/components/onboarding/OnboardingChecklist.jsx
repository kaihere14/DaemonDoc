import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  GitCommitHorizontal,
  GitPullRequest,
  Minus,
} from "lucide-react";
import { useOnboarding } from "../../context/onboarding-context";
import { useCommitType } from "../../hooks/useCommitType";
import { convexApi } from "@/lib/convexApi";
import { ThinkingOrb } from "@/components/ui/thinking-orb";
import { DokuSwap } from "./Doku";

const STEP_KEYS = ["commitType", "firstRepo", "firstReadme"];

const COMMIT_OPTIONS = [
  {
    key: "direct",
    label: "Direct",
    icon: GitCommitHorizontal,
    description: "Commit straight to your default branch.",
  },
  {
    key: "pull-request",
    label: "Pull Request",
    icon: GitPullRequest,
    description: "Open a pull request you review first.",
  },
];

const TRUST_LINES = [
  "Only README.md is changed",
  "Commits are tagged [skip ci]",
  "Turn it off anytime",
];

const MORE_TO_TRY = [
  {
    title: "Tidy a long README",
    body: "Tap the brush on any repository card.",
  },
  {
    title: "Set your AI order",
    body: "AI Priority in the toolbar picks which model writes first.",
  },
  {
    title: "Email alerts",
    body: "Get a note whenever a README changes.",
    link: { to: "/profile", label: "Open Profile" },
  },
];

/* ── Motion ───────────────────────────────────────────────────────────────
   Entrances arrive fast and settle (strong ease-out or a critically damped
   spring); exits are shorter and smaller than entrances; state swaps
   cross-fade with a little blur. Movement, scale and blur all drop out under
   reduced motion, leaving the opacity fades. */
const EASE_OUT = [0.23, 1, 0.32, 1];
const SPRING = { type: "spring", duration: 0.35, bounce: 0 };
const SWAP_SPRING = { type: "spring", duration: 0.3, bounce: 0 };
const EXIT = { duration: 0.15, ease: EASE_OUT };

// One press for everything you can click: a 0.96 squeeze that never plays on
// a disabled control.
const PRESS =
  "[-webkit-tap-highlight-color:transparent] transition-[scale,background-color,border-color,color,box-shadow,opacity] duration-150 ease-out-strong motion-safe:enabled:active:scale-[0.96]";
const LINK_PRESS =
  "[-webkit-tap-highlight-color:transparent] transition-[scale,color] duration-150 ease-out-strong motion-safe:active:scale-[0.96]";

const EYEBROW =
  "font-mono text-[10px] font-black tracking-[0.24em] text-slate-400 uppercase";
const TEXT_LINK = `group inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 ${LINK_PRESS}`;
const LINK_ARROW =
  "transition-[translate] duration-150 ease-out-strong group-hover:translate-x-0.5";

const useBlur = () => {
  const reduceMotion = useReducedMotion();
  return (px) => (reduceMotion ? "blur(0px)" : `blur(${px}px)`);
};

// A view's parts arrive in order (header, steps, footer), 100ms apart.
const viewVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
  exit: { opacity: 0, transition: EXIT },
};

const chunkVariants = (blur) => ({
  hidden: { opacity: 0, transform: "translateY(12px)", filter: blur(4) },
  visible: {
    opacity: 1,
    transform: "translateY(0px)",
    filter: blur(0),
    transition: { duration: 0.3, ease: EASE_OUT },
  },
});

// The panel and the launcher grow out of the same corner, so folding and
// reopening read as one object changing shape.
const surfaceVariants = {
  hidden: { opacity: 0, transform: "translateY(16px) scale(0.96)" },
  visible: {
    opacity: 1,
    transform: "translateY(0px) scale(1)",
    transition: SPRING,
  },
  exit: {
    opacity: 0,
    transform: "translateY(8px) scale(0.96)",
    transition: EXIT,
  },
};

// Where the user can see what the first run produced. A pull request lands on
// a branch, so its list is more useful than the bare commit.
const runLink = (run, commitType) => {
  if (!run?.repoOwner) return null;
  const repoUrl = `https://github.com/${run.repoOwner}/${run.repoName}`;
  if (run.status !== "success") {
    return { href: repoUrl, label: "Open repository" };
  }
  if (commitType === "pull-request") {
    return { href: `${repoUrl}/pulls`, label: "View pull request" };
  }
  if (run.commitId) {
    return { href: `${repoUrl}/commit/${run.commitId}`, label: "View commit" };
  }
  return { href: repoUrl, label: "Open repository" };
};

const ExternalTextLink = ({ link }) =>
  link ? (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={TEXT_LINK}
    >
      {link.label}
      <ExternalLink size={12} className={LINK_ARROW} />
    </a>
  ) : null;

// Text or a glyph that changes value: the old one lifts out as the new one
// rises in, stacked in one grid cell so nothing reflows.
const Swap = ({ swapKey, children, className = "", distance = 6 }) => {
  const blur = useBlur();
  return (
    <span className={`inline-grid ${className}`}>
      <AnimatePresence initial={false}>
        <motion.span
          key={swapKey}
          className="[grid-area:1/1]"
          initial={{ opacity: 0, y: distance, filter: blur(2) }}
          animate={{ opacity: 1, y: 0, filter: blur(0) }}
          exit={{ opacity: 0, y: -distance, filter: blur(2) }}
          transition={SWAP_SPRING}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const ProgressBar = ({ steps }) => (
  <div className="mt-3 grid grid-cols-3 gap-1" aria-hidden>
    {STEP_KEYS.map((key) => (
      <span key={key} className="h-1 overflow-hidden rounded-full bg-slate-200">
        <span
          className={`ease-out-strong block h-full origin-left rounded-full bg-blue-600 transition-[scale] duration-500 ${
            steps[key] ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </span>
    ))}
  </div>
);

const StepBadge = ({ number, done, current }) => {
  const blur = useBlur();

  return (
    <span
      className={`ease-out-strong relative mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 text-[11px] font-black transition-[background-color,border-color,color] duration-200 ${
        done
          ? "border-blue-600 bg-blue-600 text-white"
          : current
            ? "border-blue-600 bg-white text-blue-700"
            : "border-slate-200 bg-white text-slate-400"
      }`}
    >
      {/* A single ripple the moment a step completes. It is already spent
          for steps that were done before the panel opened. */}
      <AnimatePresence initial={false}>
        {done && (
          <motion.span
            key="ripple"
            aria-hidden
            className="pointer-events-none absolute -inset-0.5 rounded-full border-2 border-blue-500"
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 1.9 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        <motion.span
          key={done ? "check" : "number"}
          className="grid place-items-center [grid-area:1/1]"
          initial={{ opacity: 0, scale: 0.25, filter: blur(4) }}
          animate={{ opacity: 1, scale: 1, filter: blur(0) }}
          exit={{ opacity: 0, scale: 0.25, filter: blur(4) }}
          transition={SWAP_SPRING}
        >
          {done ? <Check size={13} strokeWidth={3} /> : number}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const StepRow = ({ number, title, done, current, summary, children }) => {
  const blur = useBlur();
  // The body clips only while it folds in or out; once open, the Save
  // button's glow and the focus rings are free to spill past its edge.
  const [folding, setFolding] = useState(false);

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <StepBadge number={number} done={done} current={current} />
        <div className="min-w-0 flex-1">
          <p
            className={`ease-out-strong text-sm font-bold transition-colors duration-200 ${
              done
                ? "text-slate-500"
                : current
                  ? "text-slate-900"
                  : "text-slate-400"
            }`}
          >
            {title}
          </p>
          <AnimatePresence initial={false}>
            {done && summary && (
              <motion.div
                key="summary"
                className="mt-0.5 text-xs text-slate-500"
                initial={{ opacity: 0, y: -4, filter: blur(4) }}
                animate={{ opacity: 1, y: 0, filter: blur(0) }}
                exit={{ opacity: 0, transition: EXIT }}
                transition={{ duration: 0.3, ease: EASE_OUT, delay: 0.1 }}
              >
                {summary}
              </motion.div>
            )}
          </AnimatePresence>
          {/* The open step folds out under its title; the one before it
              folds away as it completes. */}
          <AnimatePresence initial={false}>
            {current && (
              <motion.div
                key="body"
                className={`-mx-1 px-1 ${folding ? "overflow-hidden" : ""}`}
                onAnimationStart={() => setFolding(true)}
                onAnimationComplete={() => setFolding(false)}
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  transition: {
                    height: SPRING,
                    opacity: { duration: 0.25, ease: EASE_OUT, delay: 0.05 },
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.2, ease: EASE_OUT },
                    opacity: { duration: 0.12 },
                  },
                }}
              >
                <motion.div
                  className="pt-3 pb-1"
                  initial={{ y: 8, filter: blur(4) }}
                  animate={{ y: 0, filter: blur(0) }}
                  transition={{ duration: 0.3, ease: EASE_OUT, delay: 0.05 }}
                >
                  {children}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </li>
  );
};

const RadioDot = ({ active }) => (
  <span
    className={`ease-out-strong mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border-2 transition-[border-color] duration-150 ${
      active ? "border-blue-600" : "border-slate-300"
    }`}
  >
    <span
      className={`ease-swap size-1.5 rounded-full bg-blue-600 transition-[scale,opacity] duration-200 ${
        active ? "scale-100 opacity-100" : "scale-[0.25] opacity-0"
      }`}
    />
  </span>
);

const CommitTypeStep = ({ onConfirmed }) => {
  const { commitType, saveCommitType } = useCommitType();
  const [selected, setSelected] = useState(commitType);
  const [isSaving, setIsSaving] = useState(false);

  // Saving the default counts too: the step exists so the choice is made on
  // purpose, not so it differs from what was there.
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveCommitType(selected);
      onConfirmed(selected);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not save your choice. Please try again.",
      );
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="README commit type"
        className="grid gap-2"
      >
        {COMMIT_OPTIONS.map(({ key, label, icon: Icon, description }) => {
          const active = selected === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(key)}
              disabled={isSaving}
              className={`rounded-tile flex w-full cursor-pointer items-start gap-3 border px-3 py-2.5 text-left disabled:cursor-not-allowed ${PRESS} ${
                active
                  ? "border-blue-500 bg-blue-50/80 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <Icon
                size={16}
                className={`mt-0.5 shrink-0 transition-colors duration-150 ${
                  active ? "text-blue-700" : "text-slate-400"
                }`}
              />
              <span className="flex-1">
                <span className="block text-sm font-bold text-slate-900">
                  {label}
                </span>
                <span className="block text-xs text-slate-500">
                  {description}
                </span>
              </span>
              <RadioDot active={active} />
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className={`rounded-action bg-primary mt-3 inline-flex w-full cursor-pointer items-center justify-center px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-800 disabled:cursor-wait ${PRESS}`}
      >
        <Swap swapKey={isSaving ? "saving" : "idle"}>
          {isSaving ? (
            <span className="inline-flex items-center gap-2">
              <ThinkingOrb
                preset="working"
                showLabel={false}
                tone="ghost"
                size="sm"
                className="h-auto p-0 text-current [--orb-size:1rem]"
              />
              Saving…
            </span>
          ) : (
            "Save choice"
          )}
        </Swap>
      </button>
    </div>
  );
};

const trustListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } },
};

const trustLineVariants = {
  hidden: { opacity: 0, x: -4 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: EASE_OUT } },
};

const FirstRepoStep = () => {
  const { pathname } = useLocation();

  return (
    <div>
      <p className="text-xs text-slate-600">
        Flip the switch on any repository card. A greyed-out switch needs an
        admin of that repository.
      </p>
      <motion.ul
        className="mt-2 space-y-1"
        variants={trustListVariants}
        initial="hidden"
        animate="visible"
      >
        {TRUST_LINES.map((line) => (
          <motion.li
            key={line}
            variants={trustLineVariants}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600"
          >
            <Check size={12} strokeWidth={3} className="text-blue-600" />
            {line}
          </motion.li>
        ))}
      </motion.ul>
      {pathname !== "/home" && (
        <Link to="/home" className={`${TEXT_LINK} mt-3`}>
          Show my repositories
          <ArrowRight size={12} className={LINK_ARROW} />
        </Link>
      )}
    </div>
  );
};

const LatestRunMessage = ({ logId }) => {
  const messages = useQuery(
    convexApi.logs.getLogMessages,
    logId ? { logId } : "skip",
  );
  const latest = messages?.[messages.length - 1]?.message;
  if (!latest) return null;

  return (
    <Swap
      swapKey={latest}
      distance={8}
      className="mt-1 w-full overflow-hidden font-mono text-[11px] text-slate-500"
    >
      <span className="block truncate" title={latest}>
        {latest}
      </span>
    </Swap>
  );
};

// The only step where Doku speaks: it is the wait the user cannot speed up.
const FirstReadmeStep = ({ run }) => {
  const failed = run?.status === "failed";
  const status = failed ? "failed" : run ? "writing" : "queued";

  return (
    <div
      className={`rounded-tile flex items-start gap-3 border p-3 transition-[background-color,border-color] duration-200 ${
        failed
          ? "border-amber-200 bg-amber-50/70"
          : "border-slate-200 bg-slate-50/80"
      }`}
    >
      <DokuSwap pose={failed ? "oops" : "working"} className="w-10" />
      <div className="min-w-0 flex-1" aria-live="polite">
        <Swap
          swapKey={status}
          className="w-full text-xs font-semibold text-slate-700"
        >
          {failed
            ? "That run hit a snag. Activity Logs has the details, and your next push will try again."
            : run
              ? `Writing the README for ${run.repoName}…`
              : "Queued. I'll start in a moment."}
        </Swap>
        {!failed && <LatestRunMessage logId={run?.logId} />}
        <Link to="/logs" className={`${TEXT_LINK} mt-2`}>
          {failed ? "Open Activity Logs" : "Watch in Activity Logs"}
          <ArrowRight size={12} className={LINK_ARROW} />
        </Link>
      </div>
    </div>
  );
};

const moreListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const MoreToTry = () => {
  const [open, setOpen] = useState(false);
  const blur = useBlur();

  return (
    <div className="border-t border-slate-100 pt-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`flex w-full cursor-pointer items-center justify-between rounded-md text-xs font-bold text-slate-600 hover:text-slate-900 ${PRESS}`}
      >
        More things to try
        <ChevronDown
          size={14}
          className={`ease-out-strong transition-[rotate] duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="list"
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: { height: SPRING, opacity: { duration: 0.2 } },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.2, ease: EASE_OUT },
                opacity: { duration: 0.12 },
              },
            }}
          >
            <motion.ul
              className="space-y-2 pt-2"
              variants={moreListVariants}
              initial="hidden"
              animate="visible"
            >
              {MORE_TO_TRY.map((item) => (
                <motion.li
                  key={item.title}
                  className="text-xs"
                  variants={chunkVariants(blur)}
                >
                  <p className="font-bold text-slate-700">{item.title}</p>
                  <p className="text-slate-500">
                    {item.body}{" "}
                    {item.link && (
                      <Link to={item.link.to} className={TEXT_LINK}>
                        {item.link.label}
                      </Link>
                    )}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Six specks thrown out from behind Doku, once, when everything is done.
const BURST = [0, 60, 120, 180, 240, 300].map((angle, index) => {
  const radians = (angle * Math.PI) / 180;
  const distance = index % 2 ? 46 : 38;
  return {
    x: Math.cos(radians) * distance,
    y: Math.sin(radians) * distance,
    tone: index % 2 ? "bg-amber-200" : "bg-blue-400",
  };
});

const Celebration = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative grid place-items-center">
      {!reduceMotion && (
        <>
          <motion.span
            aria-hidden
            className="absolute size-16 rounded-full bg-blue-200/60"
            initial={{ opacity: 0.8, scale: 0.6 }}
            animate={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.15 }}
          />
          {BURST.map(({ x, y, tone }, index) => (
            <motion.span
              key={index}
              aria-hidden
              className={`absolute size-1.5 rounded-full ${tone}`}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
              animate={{
                opacity: [0, 1, 0],
                x,
                y,
                scale: 1,
              }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.2 }}
            />
          ))}
        </>
      )}
      {/* The one place Doku is allowed a little bounce: a rare, earned
          moment rather than routine UI. */}
      <motion.span
        className="relative"
        initial={{ opacity: 0, scale: 0.9, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
      >
        <DokuSwap pose="celebrate" className="w-20" />
      </motion.span>
    </div>
  );
};

const AllDone = ({ run, commitType, onDone, busy }) => {
  const blur = useBlur();
  const chunk = chunkVariants(blur);

  return (
    <motion.div
      key="done"
      className="flex flex-col items-center p-5 text-center"
      variants={viewVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Celebration />
      <motion.div variants={chunk} className="mt-3">
        <p className={EYEBROW}>Getting started</p>
        <h2
          id="onboarding-title"
          className="mt-1 text-lg font-black tracking-tight text-slate-900 uppercase"
        >
          All set
        </h2>
      </motion.div>
      <motion.p variants={chunk} className="mt-1 text-sm text-slate-500">
        I'll keep your README in step with every push.
      </motion.p>
      <motion.div variants={chunk} className="mt-2">
        <ExternalTextLink link={runLink(run, commitType)} />
      </motion.div>
      <motion.div variants={chunk} className="mt-4 w-full">
        <button
          type="button"
          onClick={onDone}
          disabled={busy}
          className={`rounded-action bg-primary inline-flex w-full cursor-pointer items-center justify-center px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-800 disabled:opacity-60 ${PRESS}`}
        >
          Done
        </button>
      </motion.div>
    </motion.div>
  );
};

const StepsView = ({
  steps,
  run,
  preferredCommitType,
  doneCount,
  currentKey,
  busy,
  onSnooze,
  onDismiss,
  onCommitTypeConfirmed,
}) => {
  const blur = useBlur();
  const chunk = chunkVariants(blur);

  const commitLabel =
    COMMIT_OPTIONS.find((option) => option.key === preferredCommitType)
      ?.label ?? "Direct";

  const readmeSummary =
    run?.status === "skipped"
      ? `${run.repoName}'s README was already up to date.`
      : run
        ? `README updated in ${run.repoName}.`
        : null;

  return (
    <motion.div
      key="steps"
      className="flex min-h-0 flex-1 flex-col"
      variants={viewVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.header
        variants={chunk}
        className="flex items-start gap-3 border-b border-slate-100 p-5 pb-4"
      >
        {/* Doku says hello once each time the panel opens. */}
        <motion.span
          className="shrink-0"
          style={{ transformOrigin: "50% 85%" }}
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -9, 7, -3, 0] }}
          transition={{ duration: 0.9, delay: 0.45, ease: "easeInOut" }}
        >
          <DokuSwap pose="wave" className="w-11" />
        </motion.span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2
              id="onboarding-title"
              className={`${EYEBROW} flex items-center gap-1`}
            >
              Getting started ·
              <Swap swapKey={doneCount} className="text-blue-700">
                {doneCount}
              </Swap>
              of 3
            </h2>
            <button
              type="button"
              onClick={onSnooze}
              aria-label="Minimise checklist"
              className={`rounded-control -mt-1 -mr-1 cursor-pointer p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 ${PRESS}`}
            >
              <Minus size={16} />
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Hi, I'm Doku. Three quick steps and your README looks after itself.
          </p>
          <ProgressBar steps={steps} />
        </div>
      </motion.header>

      <motion.div
        variants={chunk}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5"
      >
        <ol className="divide-y divide-slate-100">
          <StepRow
            number={1}
            title="Choose how README updates land"
            done={steps.commitType}
            current={currentKey === "commitType"}
            summary={`${commitLabel} · change it anytime in the toolbar.`}
          >
            <CommitTypeStep onConfirmed={onCommitTypeConfirmed} />
          </StepRow>
          <StepRow
            number={2}
            title="Turn on your first repository"
            done={steps.firstRepo}
            current={currentKey === "firstRepo"}
            summary="Connected. Every push now reaches DaemonDoc."
          >
            <FirstRepoStep />
          </StepRow>
          <StepRow
            number={3}
            title="See your first README"
            done={steps.firstReadme}
            current={currentKey === "firstReadme"}
            summary={
              <span className="flex flex-wrap items-center gap-x-2">
                {readmeSummary}
                <ExternalTextLink link={runLink(run, preferredCommitType)} />
              </span>
            }
          >
            <FirstReadmeStep run={run} />
          </StepRow>
        </ol>
        <div className="mt-4">
          <MoreToTry />
        </div>
      </motion.div>

      <motion.footer
        variants={chunk}
        className="flex items-center justify-between border-t border-slate-100 px-5 py-3"
      >
        <button
          type="button"
          onClick={onSnooze}
          className={`cursor-pointer rounded-md text-xs font-bold text-slate-600 hover:text-slate-900 ${PRESS}`}
        >
          I'll finish later
        </button>
        <button
          type="button"
          onClick={onDismiss}
          disabled={busy}
          className={`cursor-pointer rounded-md text-xs font-semibold text-slate-400 hover:text-slate-600 ${PRESS}`}
        >
          Hide for good
        </button>
      </motion.footer>
    </motion.div>
  );
};

const Launcher = ({ doneCount, onOpen }) => (
  <motion.button
    key="launcher"
    type="button"
    variants={surfaceVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    style={{ transformOrigin: "bottom right" }}
    onClick={onOpen}
    aria-label={`Open the getting started checklist, ${doneCount} of 3 done`}
    className={`group shadow-raised hover:shadow-overlay fixed right-4 bottom-4 z-30 flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white/95 py-1.5 pr-4 pl-1.5 backdrop-blur-sm hover:border-blue-200 sm:right-6 sm:bottom-6 ${PRESS}`}
  >
    <img
      src="/mascot-bust.png"
      alt=""
      width={216}
      height={256}
      className="ease-out-strong h-9 w-auto transition-[translate] duration-200 group-hover:-translate-y-0.5"
    />
    <span className="text-xs font-bold text-slate-700">Getting started</span>
    <span className="font-mono text-[11px] font-black text-blue-700">
      {doneCount}/3
    </span>
  </motion.button>
);

const OnboardingChecklist = () => {
  const context = useOnboarding();
  const posthog = usePostHog();
  const [busy, setBusy] = useState(false);

  const onboarding = context?.onboarding;
  const active = Boolean(onboarding?.active);
  const steps = onboarding?.steps;
  const doneCount = active ? STEP_KEYS.filter((key) => steps[key]).length : 0;
  const currentKey = active ? STEP_KEYS.find((key) => !steps[key]) : null;

  const send = async (event) => {
    setBusy(true);
    try {
      await context.sendEvent(event);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Folding and reopening only move the panel, so they answer at once and
  // let the server catch up.
  const toggle = (event) => {
    context.sendEvent(event).catch(() => {
      toast.error("Something went wrong. Please try again.");
    });
  };

  const handleCommitTypeConfirmed = (commitType) => {
    posthog?.capture("onboarding_commit_type_confirmed", {
      commit_type: commitType,
    });
    context.markStepDone("commitType", { preferredCommitType: commitType });
    void context.refresh();
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {!active ? null : onboarding.snoozed ? (
          <Launcher
            key="launcher"
            doneCount={doneCount}
            onOpen={() => toggle("resumed")}
          />
        ) : (
          <motion.section
            key="panel"
            aria-labelledby="onboarding-title"
            variants={surfaceVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: "bottom right" }}
            className="rounded-panel-lg shadow-overlay fixed inset-x-4 bottom-4 z-30 flex max-h-[min(38rem,calc(100dvh-6rem))] flex-col overflow-hidden border border-slate-200 bg-white/95 backdrop-blur-md sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[23rem]"
          >
            <AnimatePresence mode="wait">
              {currentKey ? (
                <StepsView
                  key="steps"
                  steps={steps}
                  run={onboarding.firstReadme}
                  preferredCommitType={onboarding.preferredCommitType}
                  doneCount={doneCount}
                  currentKey={currentKey}
                  busy={busy}
                  onSnooze={() => toggle("snoozed")}
                  onDismiss={() => send("dismissed")}
                  onCommitTypeConfirmed={handleCommitTypeConfirmed}
                />
              ) : (
                <AllDone
                  key="done"
                  run={onboarding.firstReadme}
                  commitType={onboarding.preferredCommitType}
                  onDone={() => send("completed")}
                  busy={busy}
                />
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
};

export default OnboardingChecklist;
