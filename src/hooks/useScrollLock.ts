import { useEffect, useRef } from "react";

let lockCount = 0;
let originalOverflow: string | null = null;

export function useScrollLock(active: boolean) {
  const isLocked = useRef(false);

  useEffect(() => {
    if (active && !isLocked.current) {
      if (lockCount === 0) {
        originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      }
      lockCount++;
      isLocked.current = true;
    } else if (!active && isLocked.current) {
      lockCount--;
      isLocked.current = false;
      if (lockCount === 0 && originalOverflow !== null) {
        document.body.style.overflow = originalOverflow;
        originalOverflow = null;
      }
    }

    return () => {
      if (isLocked.current) {
        lockCount--;
        isLocked.current = false;
        if (lockCount === 0 && originalOverflow !== null) {
          document.body.style.overflow = originalOverflow;
          originalOverflow = null;
        }
      }
    };
  }, [active]);
}
