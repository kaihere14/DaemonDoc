/* What Doku shows on each empty or error screen, as props for <DokuState>.
   Keeping the copy and poses together makes the set easy to review at once. */

export const repoErrorState = ({ error, onRetry }) => ({
  pose: "oops",
  tone: "error",
  title: "Couldn't load your repositories",
  description:
    "GitHub or DaemonDoc didn't answer this time. Your settings are safe; give it another go.",
  detail: error,
  action: { label: "Try again", onClick: onRetry },
});

// The repository grid can be empty for different reasons: a search with no
// match, a filter with nothing in it, or no repositories at all.
export const repoEmptyState = ({
  repoCount,
  filter,
  searchQuery,
  onClearSearch,
  onShowAll,
  onRefresh,
}) => {
  if (searchQuery) {
    return {
      pose: "reading",
      title: "No matches",
      description: `Nothing here matches "${searchQuery}". Check the spelling or search by owner instead.`,
      action: { label: "Clear search", onClick: onClearSearch },
    };
  }
  if (filter === "active" && repoCount > 0) {
    return {
      pose: "point",
      title: "Nothing turned on yet",
      description:
        "Flip the switch on any repository and I'll keep its README in step with every push.",
      action: { label: "Show all repositories", onClick: onShowAll },
    };
  }
  if (filter === "inactive" && repoCount > 0) {
    return {
      pose: "celebrate",
      title: "Every repository is on",
      description: "All of your repositories have AI README updates turned on.",
    };
  }
  return {
    pose: "reading",
    title: "No repositories yet",
    description:
      "I list the GitHub repositories you can push to. Create one on GitHub, then refresh this list.",
    action: { label: "Refresh list", onClick: onRefresh },
  };
};

export const logsErrorState = ({ error, onRetry }) => ({
  pose: "oops",
  tone: "error",
  title: "Couldn't load your activity",
  description:
    "The activity feed didn't come through this time. Your README jobs are still running.",
  detail: error,
  action: { label: "Retry", onClick: onRetry },
});

export const logsEmptyState = () => ({
  pose: "reading",
  title: "No activity yet",
  description:
    "Turn on a repository and every README job I run will show up here, step by step.",
  action: { label: "Go to repositories", to: "/home" },
});
