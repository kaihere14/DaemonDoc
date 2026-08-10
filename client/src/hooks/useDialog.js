import { useEffect } from "react";

/**
 * Shared modal behaviour: Escape dismisses, and the page behind stops scrolling
 * while the dialog owns the screen. Every modal in the app hand-rolled the
 * backdrop click and none of them handled either of these.
 *
 * Pair with `role="dialog"`, `aria-modal="true"` and `aria-labelledby` on the
 * dialog surface itself.
 */
export const useDialog = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);
};

export default useDialog;
