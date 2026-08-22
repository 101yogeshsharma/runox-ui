import { useState, useCallback, useEffect } from "react";

/**
 * Options for the useClipboard hook.
 *
 * @property timeout - The duration in milliseconds before the copy state resets.
 */
export interface UseClipboardOptions {
  timeout?: number;
}

/**
 * Returns clipboard copy state and a copy function. Handles insecure contexts gracefully.
 *
 * @param options - Configuration options for the hook.
 * @returns An object containing the copy function and the current copy state.
 *
 * @example
 * const { hasCopied, onCopy } = useClipboard({ timeout: 3000 });
 * <button onClick={() => onCopy("text")}>{hasCopied ? "Copied" : "Copy"}</button>
 */
export function useClipboard({ timeout = 2000 }: UseClipboardOptions = {}) {
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = useCallback(async (text: string) => {
    if (!text) return;
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setHasCopied(false);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
    } catch {
      setHasCopied(false);
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (hasCopied) {
      timeoutId = setTimeout(() => {
        setHasCopied(false);
      }, timeout);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [hasCopied, timeout]);

  return { value: hasCopied, onCopy, hasCopied };
}
