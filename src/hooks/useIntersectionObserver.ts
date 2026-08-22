import { useEffect, useState, RefObject } from "react";

/**
 * Options for useIntersectionObserver.
 * 
 * @property freezeOnceVisible - If true, freezes the intersection state once the element becomes visible.
 */
interface Args extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

/**
 * Observes when an element enters or leaves the viewport using IntersectionObserver.
 *
 * @param elementRef - A React ref object pointing to the target element.
 * @param args - Options including threshold, root, rootMargin, and freezeOnceVisible.
 * @returns The current IntersectionObserverEntry, or undefined if not initialized.
 *
 * @example
 * const ref = useRef(null);
 * const entry = useIntersectionObserver(ref, { threshold: 0.5 });
 * const isVisible = !!entry?.isIntersecting;
 */
export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  {
    threshold = 0,
    root = null,
    rootMargin = "0%",
    freezeOnceVisible = false,
  }: Args = {}
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  };

  useEffect(() => {
    const hasIOSupport = !!window.IntersectionObserver;
    if (!hasIOSupport || frozen) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    let node = elementRef?.current;
    if (node) {
      observer.observe(node);
    }

    let intervalId: NodeJS.Timeout | null = null;
    if (!node) {
      let retries = 0;
      const maxRetries = 20;
      intervalId = setInterval(() => {
        retries++;
        if (elementRef?.current) {
          node = elementRef.current;
          observer.observe(node);
          if (intervalId) clearInterval(intervalId);
        } else if (retries >= maxRetries) {
          if (intervalId) clearInterval(intervalId);
        }
      }, 50);
    }

    return () => {
      observer.disconnect();
      if (intervalId) clearInterval(intervalId);
    };
  }, [elementRef, threshold, root, rootMargin, frozen]);

  return entry;
}
