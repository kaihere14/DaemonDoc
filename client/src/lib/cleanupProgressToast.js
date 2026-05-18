import { toast } from "sonner";

const MESSAGE_INTERVAL_MS = 5000;

export const CLEANUP_PROGRESS_MESSAGES = [
  "Zapping clutter, reindexing context…",
  "Convincing duplicate sections to merge…",
  "Deleting vibes-only bullet points…",
  "Asking your README to calm down…",
  "Untangling feature lists from feature novels…",
  "Negotiating with stale badges…",
  "Removing changelog energy from 2019…",
  "Teaching markdown to breathe again…",
  'Consolidating five ways we said "fast"…',
  "Sweeping marketing fluff under the rug…",
  'Renaming "Overview" to something useful…',
  "Your AI librarian is on duty…",
  "Polishing headings until they behave…",
  "Almost done — README therapy in session…",
];

const FINAL_MESSAGE_INDEX = CLEANUP_PROGRESS_MESSAGES.length - 1;

export function startCleanupProgressToast() {
  let index = 0;
  const toastId = toast.loading(CLEANUP_PROGRESS_MESSAGES[0]);

  const intervalId = setInterval(() => {
    if (index >= FINAL_MESSAGE_INDEX) return;

    index += 1;
    toast.loading(CLEANUP_PROGRESS_MESSAGES[index], { id: toastId });

    if (index >= FINAL_MESSAGE_INDEX) {
      clearInterval(intervalId);
    }
  }, MESSAGE_INTERVAL_MS);

  return {
    toastId,
    stop() {
      clearInterval(intervalId);
    },
  };
}

export function completeCleanupProgressToast(progress, { success, message }) {
  progress.stop();
  if (success) {
    toast.success(message, { id: progress.toastId });
  } else {
    toast.error(message, { id: progress.toastId });
  }
}
