const warnedMessages = new Set<string>();

/**
 * Emits a console warning in development mode.
 * Safely deduplicates identical warnings to prevent console spam on re-renders.
 * 
 * Users can disable all warnings by setting \`disableDevWarnings: true\` in their RunoxProvider config,
 * which attaches a flag to the window object.
 */
export function warnInvalidProps(component: string, message: string) {
  if (process.env.NODE_ENV === "production") return;

  if (typeof window !== "undefined" && (window as any).__RUNOX_DISABLE_WARNINGS__) {
    return;
  }

  const warningKey = `${component}:${message}`;

  if (!warnedMessages.has(warningKey)) {
    console.warn(`[Runox UI - ${component}]: ${message}`);
    warnedMessages.add(warningKey);
  }
}
