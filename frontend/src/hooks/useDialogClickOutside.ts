import { useEffect } from "react";

export function useDialogClickOutside(
  ref: React.RefObject<HTMLDialogElement | null>,
  onClose: (toRefresh: boolean) => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const dialog = ref?.current;
      if (!dialog || !dialog.open) return;

      const { top, right, bottom, left } = dialog.getBoundingClientRect();
      const { clientX: x, clientY: y } = event;

      const clickedOutside = x < left || x > right || y < top || y > bottom;
      if (clickedOutside) {
        onClose(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}
