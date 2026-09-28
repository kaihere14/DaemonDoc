import React, { useState } from "react";
import { toast } from "sonner";
import { GitCommitHorizontal, GitPullRequest } from "lucide-react";
import { api, ENDPOINTS } from "@/lib/api";
import { useAuth } from "../../context/auth-context";

const COMMIT_TYPES = [
  { key: "direct", label: "Direct", icon: GitCommitHorizontal },
  { key: "pull-request", label: "Pull Request", icon: GitPullRequest },
];

// Last saved value per user, so the toggle stays correct when it remounts.
// The auth user is left untouched on purpose: replacing it with setUser
// re-renders every auth consumer, including the whole repo grid.
const savedCommitTypes = new Map();

const CommitTypeToggle = () => {
  const { user } = useAuth();
  const [commitType, setCommitType] = useState(
    savedCommitTypes.get(user?._id) || user?.preferredCommitType || "direct",
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSelect = async (nextType) => {
    if (isSaving || nextType === commitType) return;

    const previousType = commitType;
    setCommitType(nextType);
    setIsSaving(true);

    try {
      const { data } = await api.patch(ENDPOINTS.COMMIT_TYPE, {
        preferredCommitType: nextType,
      });
      setCommitType(data.preferredCommitType);
      savedCommitTypes.set(user?._id, data.preferredCommitType);
      toast.success(
        data.preferredCommitType === "pull-request"
          ? "README updates will be raised as pull requests"
          : "README updates will be committed directly",
      );
    } catch (error) {
      setCommitType(previousType);
      toast.error(
        error.response?.data?.message ||
          "Could not update commit type. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="README commit type"
      aria-busy={isSaving}
      className="rounded-tile flex shrink-0 items-center gap-1 border border-slate-200 bg-slate-50/80 p-1.5"
    >
      {COMMIT_TYPES.map(({ key, label, icon: Icon }) => {
        const active = commitType === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => handleSelect(key)}
            disabled={isSaving}
            className={`rounded-control flex flex-1 cursor-pointer items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-bold whitespace-nowrap transition-colors disabled:cursor-not-allowed sm:flex-none ${
              active
                ? "bg-primary text-white shadow-lg shadow-blue-500/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon size={15} className="shrink-0" />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default CommitTypeToggle;
