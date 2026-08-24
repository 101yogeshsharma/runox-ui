import { useEffect, useState, useCallback } from "react";

/**
 * Represents a snapshot of a single UI component's state and bounds.
 *
 * @property id - Unique identifier for the component.
 * @property component - The type or name of the component.
 * @property variant - The variant of the component.
 * @property state - The current state of the component.
 * @property action - The action associated with the component.
 * @property textContent - Truncated text content of the component.
 * @property bounds - Bounding rectangle of the component.
 */
export interface AgentComponentSnapshot {
  id: string;
  component: string;
  variant?: string;
  state?: string;
  action?: string;
  textContent: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Represents a snapshot of all tracked components at a specific point in time.
 *
 * @property timestamp - The timestamp when the snapshot was taken.
 * @property components - An array of component snapshots.
 */
export interface AgentSnapshot {
  timestamp: number;
  components: AgentComponentSnapshot[];
}

/**
 * Returns a real-time snapshot of all Runox UI components in the DOM.
 * Useful for AI agent automation to understand the current UI state.
 *
 * @returns An object containing the current agent snapshot and a refresh function.
 *
 * @example
 * const { snapshot, refresh } = useAgentContext();
 * console.log("Components:", snapshot.components);
 */
let snapshotCounter = 0;

export function useAgentContext() {
  const [snapshot, setSnapshot] = useState<AgentSnapshot>({
    timestamp: Date.now(),
    components: [],
  });

  const takeSnapshot = useCallback(() => {
    if (typeof document === "undefined") return;

    const elements = document.querySelectorAll("[data-rnx-component]");
    const components: AgentComponentSnapshot[] = Array.from(elements).map(
      (el) => {
        const htmlEl = el as HTMLElement;
        const rect = el.getBoundingClientRect();
        snapshotCounter = (snapshotCounter + 1) % 1000000;
        const fallbackId = `rnx-${Date.now()}-${snapshotCounter}`;
        const id =
          el.id ||
          (typeof crypto !== "undefined" &&
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : fallbackId);

        return {
          id,
          component: htmlEl.dataset.rnxComponent || "",
          variant: htmlEl.dataset.rnxVariant || undefined,
          state: htmlEl.dataset.rnxState || undefined,
          action: htmlEl.dataset.rnxAction || undefined,
          textContent: (el.textContent || "").slice(0, 100).trim(), // truncate to keep payload small
          bounds: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
        };
      },
    );

    const newSnapshot = {
      timestamp: Date.now(),
      components,
    };

    setSnapshot(newSnapshot);

    // Expose globally for headless agents (e.g. Puppeteer, Playwright, MCP)
    if (typeof window !== "undefined") {
      (window as any).__rnx_agent_context__ = newSnapshot;
    }
  }, []);

  useEffect(() => {
    // Initial snapshot
    takeSnapshot();

    // Use a MutationObserver to watch for DOM changes, specifically data-rnx-* attribute changes
    // Debounce it to avoid thrashing during rapid state updates
    let timeoutId: NodeJS.Timeout;
    const observer = new MutationObserver((mutations) => {
      const isRelevantChange = mutations.some(
        (m) =>
          m.type === "attributes" && m.attributeName?.startsWith("data-rnx-"),
      );

      if (isRelevantChange || mutations.some((m) => m.type === "childList")) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          takeSnapshot();
        }, 200);
      }
    });

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: [
        "data-rnx-component",
        "data-rnx-variant",
        "data-rnx-state",
        "data-rnx-action",
      ],
    });

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [takeSnapshot]);

  return { snapshot, refresh: takeSnapshot };
}
