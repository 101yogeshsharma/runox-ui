import { useEffect, useState, useCallback } from "react";

/**
 * Represents a snapshot of a single UI component's state and bounds.
 *
 * @property id - Unique identifier for the component (persisted across snapshots).
 * @property component - The type or name of the component.
 * @property variant - The variant of the component.
 * @property state - The current state of the component.
 * @property action - The action associated with the component.
 * @property overlay - Whether the component is an overlay / portal layer.
 * @property textContent - Truncated text content or input value of the component.
 * @property bounds - Bounding rectangle of the component.
 */
export interface AgentComponentSnapshot {
  id: string;
  component: string;
  variant?: string;
  state?: string;
  action?: string;
  overlay?: boolean;
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
    timestamp: 0,
    components: [],
  });

  const takeSnapshot = useCallback(() => {
    if (typeof document === "undefined") return;

    const elements = document.querySelectorAll("[data-rnx-component]");
    const components: AgentComponentSnapshot[] = Array.from(elements).map(
      (el) => {
        const htmlEl = el as HTMLElement;
        const rect = el.getBoundingClientRect();

        // Ensure stable ID across snapshot cycles for elements without explicit id prop
        let id = el.id || htmlEl.dataset.rnxGeneratedId;
        if (!id) {
          snapshotCounter = (snapshotCounter + 1) % 1000000;
          id =
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
              ? crypto.randomUUID()
              : `rnx-${Date.now()}-${snapshotCounter}`;
          htmlEl.dataset.rnxGeneratedId = id;
        }

        // Extract text content or input/textarea value (protecting sensitive/password/PII fields)
        let rawText = (el.textContent || "").trim();
        if (
          !rawText &&
          typeof HTMLInputElement !== "undefined" &&
          (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
        ) {
          const inputEl = el as HTMLInputElement;
          const autocompleteTokens = (inputEl.autocomplete || "")
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);
          const SENSITIVE_AUTOCOMPLETE_SET = new Set([
            "cc-number",
            "cc-exp",
            "cc-exp-month",
            "cc-exp-year",
            "cc-csc",
            "cc-type",
            "new-password",
            "current-password",
            "one-time-code",
            "email",
            "tel",
            "tel-country-code",
            "tel-national",
            "tel-area-code",
            "tel-local",
            "tel-extension",
            "name",
            "given-name",
            "additional-name",
            "family-name",
            "street-address",
            "address-line1",
            "address-line2",
            "address-line3",
            "postal-code",
          ]);
          const hasSensitiveAutocomplete = autocompleteTokens.some(
            (t) =>
              SENSITIVE_AUTOCOMPLETE_SET.has(t) ||
              t.startsWith("cc-") ||
              t.startsWith("address-") ||
              t.startsWith("tel-"),
          );

          const nameTokens = (inputEl.name || "")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .filter(Boolean);
          const SENSITIVE_NAME_WORDS = new Set([
            "password",
            "secret",
            "token",
            "ssn",
            "credit",
            "card",
            "cvv",
            "cvc",
            "pin",
            "otp",
            "auth",
            "email",
            "phone",
            "tel",
            "mobile",
            "address",
            "zip",
            "postal",
            "name",
          ]);
          const hasSensitiveName = nameTokens.some(
            (t) =>
              SENSITIVE_NAME_WORDS.has(t) &&
              t !== "username" &&
              t !== "filename" &&
              t !== "hotel" &&
              t !== "telemetry",
          );

          const isSensitive =
            inputEl.type === "password" ||
            inputEl.type === "email" ||
            inputEl.type === "tel" ||
            htmlEl.dataset.rnxComponent === "PasswordInput" ||
            htmlEl.dataset.rnxComponent === "OtpInput" ||
            htmlEl.dataset.rnxSensitive === "true" ||
            hasSensitiveAutocomplete ||
            hasSensitiveName ||
            Boolean(
              el.closest?.(
                '[data-rnx-component="PasswordInput"],[data-rnx-component="OtpInput"],[data-rnx-sensitive="true"]',
              ),
            );
          if (!isSensitive) {
            rawText = (inputEl.value || inputEl.placeholder || "").trim();
          }
        }

        return {
          id,
          component: htmlEl.dataset.rnxComponent || "",
          variant: htmlEl.dataset.rnxVariant || undefined,
          state: htmlEl.dataset.rnxState || undefined,
          action: htmlEl.dataset.rnxAction || undefined,
          overlay: htmlEl.dataset.rnxOverlay === "true" ? true : undefined,
          textContent: rawText.slice(0, 100), // truncate to keep payload small
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
        "data-rnx-overlay",
      ],
    });

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [takeSnapshot]);

  return { snapshot, refresh: takeSnapshot };
}
