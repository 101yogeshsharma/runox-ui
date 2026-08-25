/**
 * Internal animation/timing constants shared across overlay components.
 *
 * These values exist in one place so tests can be deterministic: components
 * that unmount after an exit animation use these durations for their
 * `setTimeout` delays, and most expose a prop to override them (e.g.
 * `exitDurationMs` on Toast, `disableExitAnimation` on overlays).
 *
 * @internal This module is not part of the public API surface.
 */

/** Exit/unmount delay for Modal's fade-out animation. */
export const MODAL_EXIT_DURATION_MS = 250;

/** Exit/unmount delay for Select's listbox close animation. */
export const SELECT_EXIT_DURATION_MS = 150;

/** Exit/unmount delay for Dropdown's menu close animation. */
export const DROPDOWN_EXIT_DURATION_MS = 150;

/** Exit/unmount delay for ContextMenu's menu close animation. */
export const CONTEXT_MENU_EXIT_DURATION_MS = 150;

/** Exit/unmount delay for NavigationMenu's close animation. */
export const NAVIGATION_MENU_EXIT_DURATION_MS = 150;

/**
 * Default exit-animation duration before a dismissed Toast is removed from
 * the DOM. Overridable per-provider via `ToastProviderProps.exitDurationMs`.
 */
export const TOAST_EXIT_DURATION_MS = 200;

/** Delay before the focus trap moves focus into a freshly opened overlay. */
export const FOCUS_TRAP_DELAY_MS = 10;

/** Poll interval while waiting for floating-position anchor refs. */
export const FLOATING_POSITION_POLL_MS = 50;

/** How long the "copied" state stays visible in copy-to-clipboard UIs. */
export const COPIED_FEEDBACK_DURATION_MS = 2000;
