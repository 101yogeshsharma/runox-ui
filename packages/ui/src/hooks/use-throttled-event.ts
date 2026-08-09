import { useEffect, useRef } from "react";

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
