/**
 * Z-index scale — prevents z-index wars.
 * Every component that needs stacking context uses a token.
 */
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  sidebar: 50,
  modal: 100,
  popover: 110,
  toast: 120,
  tooltip: 130,
  max: 9999,
} as const;
