import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Returns a throttled version of the value that only updates at most once per `interval` ms.
 * @param value - The value to throttle
 * @param interval - Throttle interval in milliseconds
 * @returns The throttled value.
 * @example
 * const throttledSearch = useThrottle(searchTerm, 300);
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    const remaining = interval - (now - lastUpdated.current);
    if (remaining <= 0) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, remaining);
      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Returns a throttled callback that fires at most once per `interval` ms.
 * @param fn - The function to throttle
 * @param interval - Throttle interval in milliseconds
 * @returns The throttled callback function.
 * @example
 * const throttledSubmit = useThrottledCallback(handleSubmit, 1000);
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): T {
  const lastCalled = useRef<number>(0);
  const fnRef = useRef<T>(fn);
  fnRef.current = fn;

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCalled.current >= interval) {
        lastCalled.current = now;
        return fnRef.current(...args);
      }
    }) as T,
    [interval]
  );
}
