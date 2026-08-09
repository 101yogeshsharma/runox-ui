import { useState, useEffect, RefObject } from "react";

interface Position {
  top: number;
  left: number;
  placed: "bottom-start" | "bottom-end" | "top-start" | "top-end";
}

export function useContextMenuPosition(
  mousePos: { x: number; y: number } | null,
  floatingRef: RefObject<HTMLElement | null>,
  isOpen: boolean
) {
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    if (!isOpen || !mousePos || !floatingRef.current) {
      if (!isOpen) setPosition(null);
      return;
    }

    const calculatePosition = () => {
      const floatingNode = floatingRef.current;
      if (!floatingNode) return;

      const floatingRect = floatingNode.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Default: bottom-right of cursor
      let top = mousePos.y;
      let left = mousePos.x;
      let placed: Position["placed"] = "bottom-start";

      // Check right collision
      if (left + floatingRect.width > viewportWidth) {
        left = Math.max(0, mousePos.x - floatingRect.width); // Flip to left of cursor
        placed = "bottom-end";
      }

      // Check bottom collision
      if (top + floatingRect.height > viewportHeight) {
        top = Math.max(0, mousePos.y - floatingRect.height); // Flip to top of cursor
        placed = placed === "bottom-end" ? "top-end" : "top-start";
      }

      setPosition({ top, left, placed });
    };

    calculatePosition();

    // We only need to calculate on open and when mouse changes, but resize also matters.
    window.addEventListener("resize", calculatePosition);
    // Also attach scroll just in case
    window.addEventListener("scroll", calculatePosition, { passive: true });

    return () => {
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition);
    };
  }, [isOpen, mousePos, floatingRef]);

  return position;
}
