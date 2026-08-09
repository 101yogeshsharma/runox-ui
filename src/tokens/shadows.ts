export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  glow: {
    brand: "0 0 15px var(--glass-highlight-hover)",
    success: "0 0 15px rgba(16, 185, 129, 0.2)",
    danger: "0 0 15px rgba(239, 68, 68, 0.2)",
  },
  modal: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
} as const;
