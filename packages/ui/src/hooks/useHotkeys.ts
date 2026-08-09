import { useEffect } from "react";

export function useHotkeys(
  key: string,
  callback: (e: KeyboardEvent) => void,
  dependencies: any[] = []
) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Split the requested key combo into parts
      const keys = key
        .toLowerCase()
        .split("+")
        .map((k) => k.trim());

      // Treat 'cmd' and 'meta' identically
      const needsMeta = keys.includes("cmd") || keys.includes("meta");
      const needsCtrl = keys.includes("ctrl");
      const needsShift = keys.includes("shift");
      const needsAlt = keys.includes("alt");

      const mainKey = keys.find(
        (k) => !["cmd", "meta", "ctrl", "shift", "alt"].includes(k)
      );

      // Some special key normalization
      let eventKey = event.key.toLowerCase();
      if (eventKey === "escape") eventKey = "esc";
      if (eventKey === " ") eventKey = "space";

      const isModifierMatch =
        !!event.metaKey === needsMeta &&
        !!event.ctrlKey === needsCtrl &&
        !!event.shiftKey === needsShift &&
        !!event.altKey === needsAlt;

      const isMainKeyMatch = mainKey ? eventKey === mainKey : true;

      // Special handling for the old hardcoded aliases just in case
      const isLegacyCmdK =
        (key.toLowerCase() === "cmd+k" || key.toLowerCase() === "ctrl+k") &&
        (event.metaKey || event.ctrlKey) &&
        eventKey === "k";

      if ((isModifierMatch && isMainKeyMatch) || isLegacyCmdK) {
        event.preventDefault(); // Prevent default browser actions for hotkeys
        callback(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, callback, ...dependencies]);
}
