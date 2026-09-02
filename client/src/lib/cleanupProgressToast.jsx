import { toast } from "sonner";
import { ThinkingOrb } from "@/components/ui/thinking-orb";

/* Sonner's own loading spinner, replaced by the searching orb, whose sphere
   reads as a round icon in sonner's square icon box, run fast enough that the
   scan stays legible at 16px.
   Sonner drops a custom `icon` on a `loading` toast (it only ever draws its own
   spinner there), so these go out as default toasts held open by an infinite
   duration instead, and the orb sized to sonner's 16px icon box. */
const cleanupToastOptions = {
  duration: Infinity,
  icon: (
    <ThinkingOrb
      preset="searching"
      speed={1.6}
      showLabel={false}
      tone="ghost"
      size="sm"
      className="h-auto p-0 text-current [--orb-size:1rem]"
    />
  ),
};

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
  const toastId = toast(CLEANUP_PROGRESS_MESSAGES[0], cleanupToastOptions);

  const intervalId = setInterval(() => {
    if (index >= FINAL_MESSAGE_INDEX) return;

    index += 1;
    toast(CLEANUP_PROGRESS_MESSAGES[index], {
      ...cleanupToastOptions,
      id: toastId,
    });

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

/* Updating by id merges over the progress toast, so the infinite duration it
   was held open with has to be replaced or the result would never dismiss. */
const RESULT_DURATION_MS = 3500;

export function completeCleanupProgressToast(progress, { success, message }) {
  progress.stop();
  const options = {
    id: progress.toastId,
    duration: RESULT_DURATION_MS,
    icon: undefined,
  };
  if (success) {
    toast.success(message, options);
  } else {
    toast.error(message, options);
  }
}
