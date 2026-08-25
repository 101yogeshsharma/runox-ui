export interface RnxAttributesOptions {
  component: string;
  variant?: string;
  state?:
    | "loading"
    | "error"
    | "open"
    | "closed"
    | "checked"
    | "unchecked"
    | "disabled"
    | "active"
    | "inactive"
    | (string & {});
  action?: "submit" | "open" | "close" | "navigate" | "toggle" | (string & {});
  /**
   * Marks the element as an overlay surface (modal, drawer, popover, …).
   * Emits `data-rnx-overlay="true"` so agents can identify portal layers.
   */
  overlay?: boolean;
}

/**
 * Generates `data-rnx-*` attributes for AI agent compatibility.
 * These semantic attributes allow headless agents to easily understand the UI structure.
 */
export function rnx(options: RnxAttributesOptions) {
  const attrs: Record<string, string> = {
    "data-rnx-component": options.component,
  };

  if (options.variant) {
    attrs["data-rnx-variant"] = options.variant;
  }
  if (options.state) {
    attrs["data-rnx-state"] = options.state;
  }
  if (options.action) {
    attrs["data-rnx-action"] = options.action;
  }
  if (options.overlay) {
    attrs["data-rnx-overlay"] = "true";
  }

  return attrs;
}
