import { useState, useCallback, useEffect } from "react";

export interface UseClipboardOptions {
  timeout?: number;
}

export function useClipboard({ timeout = 2000 }: UseClipboardOptions = {}) {
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = useCallback((text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setHasCopied(true);
    });
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
