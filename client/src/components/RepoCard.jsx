import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  GitBranch,
  Lock,
  Unlock,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { api, ENDPOINTS } from "../lib/api";
import PlanLimitModal from "./PlanLimitModal";

const RepoCard = ({ repo, showToggle = true, onToggle }) => {
  const [isActive, setIsActive] = useState(repo.activated);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitValue, setLimitValue] = useState(5);
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
      if (onToggle) onToggle();
    } catch (err) {
      if (err.response?.data?.code === "ACTIVE_REPO_LIMIT_REACHED") {
        setLimitValue(err.response.data.limit ?? 5);
        setShowLimitModal(true);
      } else {
        toast.error(
          err.response?.data?.message ||
            `Failed to ${isActive ? "deactivate" : "activate"} repository`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -4,
        boxShadow: "0 18px 40px rgba(29,78,216,0.08)",
      }}
      className="relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-4 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.25)] transition-all duration-200 hover:border-blue-200 group backdrop-blur-xl sm:rounded-[2rem] sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div
            className="flex min-w-0 items-start gap-2.5 cursor-pointer group/title sm:gap-3"
            onClick={handleCardClick}
          >
            <div className="flex items-center justify-center rounded-2xl border border-blue-100 bg-blue-50/80 p-2 shadow-inner shadow-blue-200/50">
              <GitBranch size={16} className="text-blue-600 sm:size-[18px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="min-w-0 flex-1 truncate text-base font-black uppercase tracking-tight text-slate-900 group-hover/title:text-blue-600 sm:text-lg">
                  {repo.name}
                </h3>
                <ExternalLink
                  size={14}
                  className="text-slate-400 shrink-0 opacity-60 group-hover/title:opacity-100 transition-all group-hover/title:text-blue-600"
                />
              </div>
              <p className="max-w-[220px] truncate font-mono text-[11px] text-slate-500 sm:max-w-[240px]">
                {repo.full_name}
              </p>
            </div>
          </div>
          {showToggle && (
            <div
              className="flex shrink-0 items-center gap-2 self-start"
              onClick={(e) => e.stopPropagation()}
            >
              {loading ? (
                <Loader2 size={20} className="text-slate-400 animate-spin" />
              ) : repo.canActivate === false && !isActive ? (
                <div className="group relative">
                  <button
                    onClick={() => toast.info("Admin access required to enable webhooks on this repo.")}
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 cursor-not-allowed opacity-50"
                  >
                    <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white" />
                  </button>
                  <div className="pointer-events-none absolute right-0 top-8 z-10 w-44 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    Requires admin access to create webhooks
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleToggle}
                  disabled={loading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 cursor-pointer ${
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

        <div className="flex flex-wrap items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-mono text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">
          <span className="font-black text-slate-400">{ownerLabel}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">{branchLabel}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-[11px] sm:gap-3">
          <div
            className={`flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[10px] font-black tracking-wide sm:px-3 sm:text-[11px] ${
              repo.private
                ? "bg-slate-100 text-slate-700 border-slate-200"
                : "bg-blue-50 text-blue-700 border-blue-100"
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
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-b from-transparent via-transparent to-white pointer-events-none" />

      <PlanLimitModal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limit={limitValue}
      />
    </motion.div>
  );
};

export default RepoCard;
