import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  GitBranch,
  Lock,
  Unlock,
  Loader2,
  ExternalLink,
  BrushCleaning,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api, ENDPOINTS } from "@/lib/api";
import { convexApi } from "@/lib/convexApi";
import { usePostHog } from "@posthog/react";

// The worker's terminal messages, matched so the toast can settle instead of
// guessing on a timer. Kept in sync with cleanupHandler in git.worker.js.
const CLEANUP_SUCCESS_PREFIX = "✓ README committed";
const CLEANUP_FAILURE_PREFIX = "✗ README cleanup failed";
const CLEANUP_TOAST_DURATION_MS = 5000;

const cleanupToastId = (logId) => `cleanup-progress-${logId}`;

// liveUpdate fires Convex mutations without awaiting them, so the terminal
// message is not guaranteed to be the newest — scan instead of trusting the
// tail. Returns null while there is nothing to show yet.
const readCleanupOutcome = (messages) => {
  if (!messages?.length) return null;

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const { message } = messages[i];
    if (message.startsWith(CLEANUP_SUCCESS_PREFIX)) {
      return { settled: true, succeeded: true, message };
    }
    if (message.startsWith(CLEANUP_FAILURE_PREFIX)) {
      return { settled: true, succeeded: false, message };
    }
  }

  return {
    settled: false,
    succeeded: false,
    message: messages[messages.length - 1].message,
  };
};

const RepoCard = ({
  repo,
  showToggle = true,
  onToggle,
  onActivate,
  isWalkthroughTarget = false,
  isPreview = false,
  highlightCleanupButton = false,
}) => {
  const reduceMotion = useReducedMotion();
  const posthog = usePostHog();
  const [isActive, setIsActive] = useState(repo.activated);
  const [loading, setLoading] = useState(false);
  const [isEnqueueingCleanup, setIsEnqueueingCleanup] = useState(false);
  const [cleanupLogId, setCleanupLogId] = useState(null);
  const settledCleanupRef = useRef(null);
  const cleanupMessages = useQuery(
    convexApi.logs.getLogMessages,
    cleanupLogId ? { logId: cleanupLogId } : "skip",
  );

  // Progress is derived from the worker's log stream rather than mirrored into
  // state, so the button stays spinning until the job actually reports back.
  const cleanupOutcome = useMemo(
    () => readCleanupOutcome(cleanupMessages),
    [cleanupMessages],
  );
  const isCleaningUp =
    isEnqueueingCleanup || (Boolean(cleanupLogId) && !cleanupOutcome?.settled);

  const ownerLabel =
    repo.owner || repo.full_name?.split("/")?.[0] || "Repository";
  const branchLabel = repo.default_branch || "main";

  const handleCardClick = () => {
    const githubUrl = `https://github.com/${repo.full_name}`;
    window.open(githubUrl, "_blank", "noopener,noreferrer");
  };

  const handleToggle = async (e) => {
    e.stopPropagation();
    setLoading(true);

    const endpoint = isActive ? ENDPOINTS.DEACTIVATE_REPO : ENDPOINTS.ADD_REPO;
    const action = isActive ? "Deactivated" : "Activated";
    const body = isActive
      ? { repoId: repo.id }
      : {
          repoId: repo.id,
          repoName: repo.name,
          repoFullName: repo.full_name,
          repoOwner: repo.owner,
          defaultBranch: repo.default_branch,
        };

    try {
      await api.post(endpoint, body);
      setIsActive(!isActive);
      toast.success(`${action} ${repo.name} Successfully`);
      posthog?.capture(isActive ? "repo_deactivated" : "repo_activated", {
        repo_name: repo.name,
        repo_full_name: repo.full_name,
        repo_private: repo.private,
      });
      if (!isActive && onActivate) onActivate();
      if (onToggle) onToggle();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          `Failed to ${isActive ? "deactivate" : "activate"} repository`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Cleanup runs on a queue, so the request only enqueues it. The toast is
  // driven by the worker's own log messages, keyed by the logId in the 202.
  useEffect(() => {
    if (!cleanupLogId || !cleanupOutcome) return;

    const toastId = cleanupToastId(cleanupLogId);

    if (!cleanupOutcome.settled) {
      toast.loading(cleanupOutcome.message, { id: toastId });
      return;
    }

    // Terminal messages never change again, but a remount would replay them.
    if (settledCleanupRef.current === cleanupLogId) return;
    settledCleanupRef.current = cleanupLogId;

    // A loading toast has no duration, and sonner keeps whatever the toast was
    // created with when an update reuses the id — pass one so it can close.
    if (cleanupOutcome.succeeded) {
      toast.success("Your README is now clean and tidy", {
        id: toastId,
        duration: CLEANUP_TOAST_DURATION_MS,
      });
      posthog?.capture("readme_cleanup_completed", {
        repo_name: repo.name,
        repo_full_name: repo.full_name,
      });
      return;
    }

    const reason = cleanupOutcome.message
      .slice(CLEANUP_FAILURE_PREFIX.length)
      .replace(/^:\s*/, "");
    toast.error(reason || "Failed to clean up your README", {
      id: toastId,
      duration: CLEANUP_TOAST_DURATION_MS,
    });
    posthog?.capture("readme_cleanup_failed", {
      repo_name: repo.name,
      repo_full_name: repo.full_name,
    });
  }, [cleanupLogId, cleanupOutcome, posthog, repo.name, repo.full_name]);

  // A loading toast never auto-dismisses, so one left without an updater hangs
  // on screen forever. Drop it if this card stops watching the job — unmounted,
  // or superseded by a newer cleanup — unless it already settled.
  useEffect(() => {
    if (!cleanupLogId) return undefined;

    return () => {
      if (settledCleanupRef.current !== cleanupLogId) {
        toast.dismiss(cleanupToastId(cleanupLogId));
      }
    };
  }, [cleanupLogId]);

  const handleCleanUp = async (e) => {
    e.stopPropagation();
    if (isCleaningUp) return;

    setIsEnqueueingCleanup(true);

    try {
      const res = await api.post(ENDPOINTS.CLEAN_UP_README, {
        repoId: repo.id,
      });
      if (res.status !== 202 || !res.data?.logId) {
        throw new Error("Cleanup could not be queued");
      }

      posthog?.capture("readme_cleanup_started", {
        repo_name: repo.name,
        repo_full_name: repo.full_name,
      });
      toast.loading("Queued README cleanup", {
        id: cleanupToastId(res.data.logId),
      });
      setCleanupLogId(res.data.logId);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to clean up your README",
      );
    } finally {
      setIsEnqueueingCleanup(false);
    }
  };

  const cardClassName = `group relative flex h-full flex-col overflow-hidden rounded-panel bg-white/90 p-4 backdrop-blur-xl transition-[box-shadow,border-color] duration-200 sm:rounded-panel-lg sm:p-6 ${
    isWalkthroughTarget && !isActive
      ? "border-2 border-dashed border-blue-400 shadow-[0_8px_30px_-18px_rgba(29,78,216,0.35)]"
      : "border border-slate-200/80 shadow-card hover:border-blue-200 hover:shadow-raised"
  }${isPreview ? " pointer-events-none" : ""}`;

  const cardContent = (
    <>
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div
            className="group/title flex min-w-0 cursor-pointer items-start gap-2.5 sm:gap-3"
            onClick={handleCardClick}
          >
            <div className="flex items-center justify-center rounded-2xl border border-blue-100 bg-blue-50/80 p-2 shadow-inner shadow-blue-200/50">
              <GitBranch size={16} className="text-blue-600 sm:size-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h3 className="min-w-0 flex-1 truncate text-base font-black tracking-tight text-slate-900 uppercase group-hover/title:text-blue-600 sm:text-lg">
                  {repo.name}
                </h3>
                <ExternalLink
                  size={14}
                  className="shrink-0 text-slate-400 opacity-60 transition-all group-hover/title:text-blue-600 group-hover/title:opacity-100"
                />
              </div>
              <p className="truncate font-mono text-[11px] text-slate-500">
                {repo.full_name}
              </p>
            </div>
          </div>
          {showToggle && (
            <div
              className="flex shrink-0 items-center gap-2 self-start"
              onClick={(e) => e.stopPropagation()}
            >
              {isWalkthroughTarget &&
                !isActive &&
                !loading &&
                (reduceMotion ? (
                  <span className="text-xs font-bold text-blue-500 select-none">
                    Enable →
                  </span>
                ) : (
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.0,
                      ease: "easeInOut",
                    }}
                    className="text-xs font-bold text-blue-500 select-none"
                  >
                    Enable →
                  </motion.span>
                ))}
              {loading ? (
                <Loader2 size={20} className="animate-spin text-slate-400" />
              ) : repo.canActivate === false && !isActive ? (
                <button
                  type="button"
                  role="switch"
                  aria-checked={false}
                  aria-disabled="true"
                  aria-label={`Enable AI README updates for ${repo.name} (admin access required)`}
                  onClick={() =>
                    toast.info(
                      "Admin access required to enable webhooks on this repo.",
                    )
                  }
                  className="relative inline-flex h-6 w-11 cursor-not-allowed items-center rounded-full bg-slate-200 opacity-50"
                >
                  <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white" />
                </button>
              ) : (
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  aria-label={`AI README updates for ${repo.name}`}
                  onClick={handleToggle}
                  disabled={loading}
                  className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:outline-none ${
                    isActive ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1 font-mono text-[10px] tracking-[0.14em] text-slate-400 uppercase sm:text-[11px] sm:tracking-[0.18em]">
          <span className="font-black text-slate-400">{ownerLabel}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">{branchLabel}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-[11px] sm:gap-3">
          <div
            className={`flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[10px] font-black tracking-wide sm:px-3 sm:text-[11px] ${
              repo.private
                ? "border-slate-200 bg-slate-100 text-slate-700"
                : "border-blue-100 bg-blue-50 text-blue-700"
            }`}
          >
            {repo.private ? (
              <>
                <Lock size={12} />
                Private
              </>
            ) : (
              <>
                <Unlock size={12} />
                Public
              </>
            )}
          </div>
          <div
            className={`flex min-w-0 items-center gap-2 text-[11px] font-semibold sm:text-xs ${
              isActive ? "text-blue-700" : "text-slate-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full transition ${
                isActive ? "bg-blue-600" : "bg-slate-300"
              }`}
            />
            <span className="truncate">
              {isActive ? "AI README updates enabled" : "AI updates disabled"}
            </span>
          </div>

          {/* Anchored to the card's own padding (p-4 / sm:p-6) — right-5/bottom-5
              matched neither breakpoint, so it sat 4px off at every width. */}
          <div
            className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={isCleaningUp}
              onClick={handleCleanUp}
              aria-label="Clean up README"
              className={`flex items-center justify-center rounded-2xl border border-blue-100 bg-blue-50/80 p-2 shadow-inner shadow-blue-400/50 transition-all duration-200 ${
                isPreview
                  ? ""
                  : "cursor-pointer hover:bg-blue-50/90 hover:shadow-blue-400/70 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              }${highlightCleanupButton ? " ring-2 ring-blue-500 ring-offset-2" : ""}`}
            >
              {!isCleaningUp ? (
                <BrushCleaning size={16} className="text-blue-600" />
              ) : (
                <Loader size={16} className="animate-spin text-blue-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-b from-transparent via-transparent to-white" />
    </>
  );

  if (isPreview) {
    return <div className={cardClassName}>{cardContent}</div>;
  }

  return (
    // Hover elevation is a CSS transition on the card class, not a framer
    // `whileHover` — JS-driven box-shadow forces a style recalc per frame on
    // every card in the grid.
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.3, ease: "easeOut" }}
      className={cardClassName}
    >
      {cardContent}
    </motion.div>
  );
};

export default RepoCard;
