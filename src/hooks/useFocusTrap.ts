import { useEffect, RefObject, useRef } from "react";

const FOCUSABLE_ELEMENTS = [
  "a[href]",
  "area[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "iframe",
  "object",
  "embed",
  '[tabindex="0"]',
  "[contenteditable]",
].join(",");

/**
 * Traps keyboard focus within a container element, essential for modal accessibility.
 * Returns focus to the previously focused element on cleanup.
 *
 * @param ref - Reference to the container element where focus should be trapped.
 * @param active - Whether the focus trap is currently active.
 *
 * @example
 * const modalRef = useRef(null);
 * useFocusTrap(modalRef, isOpen);
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  active: boolean = true
) {
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (!active || !ref.current) return;

    const el = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement;

    // Auto-focus first focusable element on mount
    const focusableNodes = Array.from(
      el.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)
    );
    if (focusableNodes.length > 0) {
      // Small timeout to ensure modal rendering is complete
      timeoutIds.current.push(setTimeout(() => focusableNodes[0].focus(), 10));
    } else {
      timeoutIds.current.push(setTimeout(() => el.focus(), 10));
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const nodes = Array.from(
        el.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)
      );
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }

      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstNode) {
          e.preventDefault();
          lastNode.focus();
        }
      } else {
        if (document.activeElement === lastNode) {
          e.preventDefault();
          firstNode.focus();
        }
      }
    };

    el.addEventListener("keydown", handleKeyDown);

    return () => {
      el.removeEventListener("keydown", handleKeyDown);
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
      previouslyFocused?.focus();
    };
  }, [ref, active]);
}
