import { useState, useEffect } from "react";

/**
 * Returns a debounced version of the value that only updates after the specified delay.
 *
 * @param value - The value to debounce.
 * @param delay - The delay in milliseconds to wait before updating the value.
 * @returns The debounced value.
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
