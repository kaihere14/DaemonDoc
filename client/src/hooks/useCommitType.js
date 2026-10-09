import { useCallback, useSyncExternalStore } from "react";
import { api, ENDPOINTS } from "../lib/api";
import { useAuth } from "../context/auth-context";

// Last saved value per user, shared by every control that edits it (the
// toolbar toggle and the onboarding checklist), so changing it in one place
// updates the other. The auth user is left untouched on purpose: replacing it
// with setUser re-renders every auth consumer, including the whole repo grid.
const savedCommitTypes = new Map();
const listeners = new Set();

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const setSavedCommitType = (userId, commitType) => {
  savedCommitTypes.set(userId, commitType);
  listeners.forEach((listener) => listener());
};

export function useCommitType() {
  const { user } = useAuth();
  const userId = user?._id;

  const saved = useSyncExternalStore(subscribe, () =>
    savedCommitTypes.get(userId),
  );
  const commitType = saved || user?.preferredCommitType || "direct";

  // Optimistic: the choice shows straight away and rolls back if the request
  // fails. The error is rethrown so the caller can say what went wrong.
  const saveCommitType = useCallback(
    async (nextType) => {
      const previousType = commitType;
      setSavedCommitType(userId, nextType);

      try {
        const { data } = await api.patch(ENDPOINTS.COMMIT_TYPE, {
          preferredCommitType: nextType,
        });
        setSavedCommitType(userId, data.preferredCommitType);
        return data.preferredCommitType;
      } catch (error) {
        setSavedCommitType(userId, previousType);
        throw error;
      }
    },
    [commitType, userId],
  );

  return { commitType, saveCommitType };
}
