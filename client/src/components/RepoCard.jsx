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

const RepoCard = ({ repo, showToggle = true, onToggle }) => {
  const [isActive, setIsActive] = useState(repo.activated);
  const [loading, setLoading] = useState(false);
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
      toast.error(
        err.response?.data?.message ||
          `Failed to ${isActive ? "deactivate" : "activate"} repository`,
      );
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
      className="relative overflow-hidden bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] p-6 transition-all duration-200 hover:border-blue-200 group flex flex-col h-full shadow-[0_8px_30px_-18px_rgba(15,23,42,0.25)]"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div
            className="flex items-start gap-3 min-w-0 cursor-pointer group/title"
            onClick={handleCardClick}
          >
            <div className="rounded-2xl bg-blue-50/80 border border-blue-100 p-2 flex items-center justify-center shadow-inner shadow-blue-200/50">
              <GitBranch size={18} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="flex-1 min-w-0 text-lg font-black uppercase tracking-tight text-slate-900 truncate group-hover/title:text-blue-600">
                  {repo.name}
                </h3>
                <ExternalLink
                  size={14}
                  className="text-slate-400 shrink-0 opacity-60 group-hover/title:opacity-100 transition-all group-hover/title:text-blue-600"
                />
              </div>
              <p className="font-mono text-[11px] text-slate-500 truncate max-w-[240px]">
                {repo.full_name}
              </p>
            </div>
          </div>
          {showToggle && (
            <div
              className="flex items-center gap-2 self-start"
              onClick={(e) => e.stopPropagation()}
            >
              {loading ? (
                <Loader2 size={20} className="text-slate-400 animate-spin" />
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

        <div className="flex flex-wrap items-center gap-1 text-[11px] uppercase tracking-[0.18em] font-mono text-slate-400">
          <span className="font-black text-slate-400">{ownerLabel}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">{branchLabel}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <div
            className={`flex items-center gap-1 rounded-xl px-3 py-1 border text-[11px] font-black tracking-wide ${
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
            className={`flex items-center gap-2 text-xs font-semibold ${
              isActive ? "text-blue-700" : "text-slate-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full transition ${
                isActive ? "bg-blue-600" : "bg-slate-300"
              }`}
            />
            {isActive ? "AI README updates enabled" : "AI updates disabled"}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-b from-transparent via-transparent to-white pointer-events-none" />
    </motion.div>
  );
};

export default RepoCard;
