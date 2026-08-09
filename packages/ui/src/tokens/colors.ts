/**
 * Semantic color tokens.
 * All values reference CSS custom properties that will be bundled with the library.
 */
export const colors = {
  // Backgrounds
  bg: {
    base: "var(--bg-base)",
    card: "var(--bg-card)",
    modal: "var(--bg-modal)",
    surface: "var(--bg-surface)",
    input: "var(--input-bg)",
  },

  // Text
  text: {
    primary: "var(--text-main)",
    secondary: "var(--text-muted)",
    inverse: "var(--bg-base)",
    link: "var(--brand-alt)",
    disabled: "var(--text-muted)",
  },

  // Brand
  brand: {
    primary: "var(--brand-glow)",
    secondary: "var(--brand-alt)",
  },

  // Semantic
  status: {
    success: "var(--brand-success)",
    danger: "var(--brand-danger)",
    warning: "var(--brand-warning)",
    info: "var(--brand-alt)",
  },

  // Borders
  border: {
    default: "var(--border-color)",
    hover: "var(--border-hover)",
    focus: "var(--brand-alt)",
    modal: "var(--modal-border-color)",
  },

  // Glass (translucent UI layers)
  glass: {
    highlight: "var(--glass-highlight)",
    highlightHover: "var(--glass-highlight-hover)",
    highlightActive: "var(--glass-highlight-active)",
    border: "var(--glass-border)",
  },
} as const;

export type ColorToken = typeof colors;
