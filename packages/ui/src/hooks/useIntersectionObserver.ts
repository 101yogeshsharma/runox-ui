import { useEffect, useState, RefObject } from "react";

interface Args extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

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
      intervalId = setInterval(() => {
        if (elementRef?.current) {
          node = elementRef.current;
          observer.observe(node);
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
