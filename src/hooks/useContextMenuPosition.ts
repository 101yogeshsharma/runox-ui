import { useState, useEffect, RefObject } from "react";

/**
 * Represents the position and placement of the context menu.
 *
 * @property top - The top coordinate in pixels.
 * @property left - The left coordinate in pixels.
 * @property placed - The placement direction relative to the cursor.
 */
interface Position {
  top: number;
  left: number;
  placed: "bottom-start" | "bottom-end" | "top-start" | "top-end";
}

/**
 * Calculates the position for a context menu, adjusted to avoid viewport overflow.
 *
 * @param mousePos - The current mouse position coordinates, or null.
 * @param floatingRef - A React RefObject pointing to the floating menu element.
 * @param isOpen - Whether the context menu is currently open.
 * @returns The calculated Position object, or null if the menu is closed or unpositioned.
 *
 * @example
 * const position = useContextMenuPosition({ x: 100, y: 200 }, menuRef, true);
 */
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
