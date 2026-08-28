import { useEffect, useRef } from "react";

let lockCount = 0;
let originalOverflow: string | null = null;
let originalPaddingRight: string | null = null;

/**
 * Locks body scroll while a modal or overlay is open. Compensates for scrollbar width to prevent layout shift.
 *
 * @param active - Whether the scroll lock is active.
 *
 * @example
 * useScrollLock(isModalOpen);
 */
export function useScrollLock(active: boolean) {
  const isLocked = useRef(false);

  useEffect(() => {
    if (active && !isLocked.current) {
      if (lockCount === 0) {
        originalOverflow = document.body.style.overflow;
        originalPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = scrollbarWidth + "px";
        document.body.style.overflow = "hidden";
      }
      lockCount++;
      isLocked.current = true;
    } else if (!active && isLocked.current) {
      lockCount--;
      isLocked.current = false;
      if (lockCount === 0 && originalOverflow !== null) {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight ?? "";
        originalOverflow = null;
        originalPaddingRight = null;
      }
    }

    return () => {
      if (isLocked.current) {
        lockCount--;
        isLocked.current = false;
        if (lockCount === 0 && originalOverflow !== null) {
          document.body.style.overflow = originalOverflow;
          document.body.style.paddingRight = originalPaddingRight ?? "";
          originalOverflow = null;
          originalPaddingRight = null;
        }
      }
    };
  }, [active]);
}
