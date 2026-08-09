export const motion = {
  easing: {
    default: "cubic-bezier(0.16, 1, 0.3, 1)",
    spring: "cubic-bezier(0.175, 0.885, 0.32, 1.15)",
    springBouncy: "cubic-bezier(0.34, 1.56, 0.64, 1.3)",
    linear: "linear",
    easeIn: "cubic-bezier(0.55, 0, 1, 0.45)",
    easeOut: "cubic-bezier(0, 0.55, 0.45, 1)",
    easeInOut: "cubic-bezier(0.85, 0, 0.15, 1)",
  },
  duration: {
    instant: "0ms",
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
    verySlow: "800ms",
  },
} as const;
