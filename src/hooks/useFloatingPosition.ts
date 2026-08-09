import { RefObject, useEffect, useState } from "react";

export type FloatingPosition = {
  top: number;
  left: number;
  placed: "bottom" | "top" | "left" | "right";
};

export function useFloatingPosition(
  anchorRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  active: boolean = true,
  offset: number = 8,
  triggerRecalc?: any,
  preferredPosition: "top" | "right" | "bottom" | "left" = "bottom",
  align: "start" | "center" | "end" = "start"
) {
  const [position, setPosition] = useState<FloatingPosition | null>(null);

  useEffect(() => {
    if (!active || !anchorRef.current || !floatingRef.current) {
      setPosition(null);
      return;
    }

    const calculatePosition = () => {
      const anchor = anchorRef.current;
      const floating = floatingRef.current;
      if (!anchor || !floating) return;

      const anchorRect = anchor.getBoundingClientRect();
      const floatingRect = floating.getBoundingClientRect();

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = 0;
      let left = 0;
      let placed = preferredPosition;

      if (preferredPosition === "bottom" || preferredPosition === "top") {
        if (preferredPosition === "bottom") {
          top = anchorRect.bottom + offset;
          if (top + floatingRect.height > viewportHeight) {
            const topCandidate = anchorRect.top - floatingRect.height - offset;
            if (topCandidate >= 0) {
              top = topCandidate;
              placed = "top";
            }
          }
        } else {
          top = anchorRect.top - floatingRect.height - offset;
          if (top < 0) {
            const bottomCandidate = anchorRect.bottom + offset;
            if (bottomCandidate + floatingRect.height <= viewportHeight) {
              top = bottomCandidate;
              placed = "bottom";
            }
          }
        }

        if (align === "start") {
          left = anchorRect.left;
        } else if (align === "center") {
          left =
            anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2;
        } else {
          left = anchorRect.right - floatingRect.width;
        }

        // Adjust left to stay in viewport
        if (left < 0) left = 0;
        else if (left + floatingRect.width > viewportWidth)
          left = viewportWidth - floatingRect.width;
      } else {
        if (preferredPosition === "right") {
          left = anchorRect.right + offset;
          if (left + floatingRect.width > viewportWidth) {
            const leftCandidate = anchorRect.left - floatingRect.width - offset;
            if (leftCandidate >= 0) {
              left = leftCandidate;
              placed = "left";
            }
          }
        } else {
          left = anchorRect.left - floatingRect.width - offset;
          if (left < 0) {
            const rightCandidate = anchorRect.right + offset;
            if (rightCandidate + floatingRect.width <= viewportWidth) {
              left = rightCandidate;
              placed = "right";
            }
          }
        }

        if (align === "start") {
          top = anchorRect.top;
        } else if (align === "center") {
          top =
            anchorRect.top + anchorRect.height / 2 - floatingRect.height / 2;
        } else {
          top = anchorRect.bottom - floatingRect.height;
        }

        // Adjust top to stay in viewport
        if (top < 0) top = 0;
        else if (top + floatingRect.height > viewportHeight)
          top = viewportHeight - floatingRect.height;
      }

      setPosition({
        top: top + window.scrollY,
        left: left + window.scrollX,
        placed,
      });
    };

    let rAFId: number | null = null;
    let observer: ResizeObserver | null = null;
    let pollTimeout: NodeJS.Timeout;

    const handleUpdate = () => {
      if (rAFId) cancelAnimationFrame(rAFId);
      rAFId = requestAnimationFrame(() => {
        calculatePosition();
        rAFId = null;
      });
    };

    let pollCount = 0;
    const pollForRefs = () => {
      if (anchorRef.current && floatingRef.current) {
        handleUpdate();
        observer = new ResizeObserver(handleUpdate);
        observer.observe(anchorRef.current);
        observer.observe(floatingRef.current);
      } else if (pollCount < 20) {
        pollCount++;
        pollTimeout = setTimeout(pollForRefs, 50);
      }
    };
    pollForRefs();

    window.addEventListener("resize", handleUpdate);
    document.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      document.removeEventListener("scroll", handleUpdate, true);
      if (rAFId) cancelAnimationFrame(rAFId);
      if (observer) observer.disconnect();
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [
    active,
    anchorRef,
    floatingRef,
    offset,
    triggerRecalc,
    preferredPosition,
    align,
  ]);

  return position;
}
