import { useEffect, useRef } from "react";

/**
 * Adds a throttled event listener to a DOM element.
 *
 * @param eventName - The name of the event to listen for.
 * @param handler - The event handler callback function.
 * @param element - The target element or RefObject. Defaults to window.
 * @param delay - The throttle delay in milliseconds. Defaults to 200.
 * @returns void
 *
 * @example
 * useThrottledEvent("scroll", (e) => console.log("Scrolled!", e), window, 300);
 */
export function useThrottledEvent(
  eventName: string,
  handler: (event: Event) => void,
  element:
    EventTarget | React.RefObject<EventTarget | null> | null = typeof window !==
  "undefined"
    ? window
    : null,
  delay: number = 200
) {
  const handlerRef = useRef(handler);
  const timeoutRef = useRef<number | null>(null);
  const lastRunRef = useRef<number>(0);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement =
      element && "current" in element ? element.current : element;
    if (!targetElement) return;

    const handleEvent = (event: Event) => {
      const now = Date.now();

      if (now - lastRunRef.current >= delay) {
        handlerRef.current(event);
        lastRunRef.current = now;
      } else {
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(
          () => {
            handlerRef.current(event);
            lastRunRef.current = Date.now();
          },
          delay - (now - lastRunRef.current)
        );
      }
    };

    targetElement.addEventListener(eventName, handleEvent as EventListener, {
      passive: true,
    });

    return () => {
      targetElement.removeEventListener(
        eventName,
        handleEvent as EventListener
      );
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [eventName, element, delay]);
}
