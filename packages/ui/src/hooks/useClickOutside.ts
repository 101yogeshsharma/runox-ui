import { useEffect, useRef, RefObject } from "react";

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      const target = event.target as Node;

      // If the node was detached before the event reached the document, ignore it.
      if (!document.documentElement.contains(target)) {
        return;
      }

      if (!el || el.contains(target)) {
        return;
      }

      // If the click is inside another overlay (e.g. a nested Popover or Toast),
      // we assume it is a child portal and do not close this parent overlay.
      const targetOverlay = (target as Element).closest?.("[data-rnx-overlay]");
      const myOverlay = el.closest("[data-rnx-overlay]");
      if (targetOverlay && targetOverlay !== myOverlay) {
        return;
      }

      handlerRef.current(event);
    };

    document.addEventListener("mousedown", listener, true);
    document.addEventListener("touchstart", listener, true);

    return () => {
      document.removeEventListener("mousedown", listener, true);
      document.removeEventListener("touchstart", listener, true);
    };
  }, [ref]);
}
