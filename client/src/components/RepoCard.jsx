import React, { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Lock, Unlock, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { api, ENDPOINTS } from "../lib/api";

const RepoCard = ({ repo, showToggle = true, onToggle }) => {
  const [isActive, setIsActive] = useState(repo.activated);
  const [loading, setLoading] = useState(false);

  const handleCardClick = () => {
    // Open GitHub repository in new tab
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
        boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
      }}
      className="bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 transition-all duration-50 hover:border-slate-300 group flex flex-col h-full shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div 
            className="flex items-center gap-2 mb-1 cursor-pointer group/title w-fit"
            onClick={handleCardClick}
          >
            <GitBranch size={16} className="text-slate-400 shrink-0 group-hover/title:text-primary transition-colors" />
            <h3 className="text-lg font-bold text-slate-900 truncate group-hover/title:text-primary transition-colors decoration-primary/30 underline-offset-4 hover:underline">
              {repo.name}
            </h3>
            <ExternalLink
              size={14}
              className="text-slate-400 shrink-0 opacity-50 group-hover/title:opacity-100 transition-all group-hover/title:text-primary"
            />
          </div>
          <p className="text-xs text-slate-500 truncate">{repo.full_name}</p>
        </div>

        {showToggle && (
          <div
            className="flex items-center gap-2 ml-4"
            onClick={(e) => e.stopPropagation()}
          >
            {loading ? (
              <Loader2 size={20} className="text-slate-400 animate-spin" />
            ) : (
              <button
                onClick={handleToggle}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 cursor-pointer ${
                  isActive ? "bg-emerald-500" : "bg-slate-300"
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

      <div className="flex items-center gap-3 text-xs text-slate-600">
        {repo.private ? (
          <span className="flex items-center gap-1.5 bg-amber-50/80 text-amber-700 px-2.5 py-1 rounded-xl border border-amber-100/50 text-[11px] font-bold tracking-wide">
            <Lock size={12} />
            Private
          </span>
        ) : (
          <span className="flex items-center gap-1.5 bg-emerald-50/80 text-emerald-700 px-2.5 py-1 rounded-xl border border-emerald-100/50 text-[11px] font-bold tracking-wide">
            <Unlock size={12} />
            Public
          </span>
        )}
        <span className="text-slate-400">•</span>
        <span className="text-slate-500">{repo.default_branch}</span>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 min-h-[28px] flex items-center">
        {isActive ? (
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-emerald-500 rounded-full"
            />
            AI README updates enabled
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <div className="w-2 h-2 bg-slate-300 rounded-full" />
            AI updates disabled
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RepoCard;
