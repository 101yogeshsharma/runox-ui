import { vi } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * Options for {@link setupRunoxTests}.
 */
export interface SetupRunoxTestsOptions {
  /**
   * Skip installing the `matchMedia` mock (e.g. when your environment
   * already provides one).
   * @default false
   */
  skipMatchMedia?: boolean;
  /**
   * Skip installing the `ResizeObserver` stub.
   * @default false
   */
  skipResizeObserver?: boolean;
  /**
   * Skip the `PointerEvent` polyfill.
   * @default false
   */
  skipPointerEvent?: boolean;
  /**
   * Skip mocking `scrollIntoView` / pointer-capture methods on
   * `HTMLElement.prototype`.
   * @default false
   */
  skipElementMocks?: boolean;
  /**
   * Skip registering automatic Testing Library `cleanup()` after each test.
   * @default false
   */
  skipCleanup?: boolean;
}

/**
 * Installs the browser-environment shims that `@runox/ui` components rely on
 * in jsdom/happy-dom test environments:
 *
 * - `window.matchMedia` mock (components read media queries for responsive
 *   and reduced-motion behavior)
 * - `ResizeObserver` stub (positioning logic observes trigger/content sizes)
 * - `PointerEvent` polyfill (jsdom lacks it)
 * - `scrollIntoView`, `hasPointerCapture`, `setPointerCapture`,
 *   `releasePointerCapture` mocks on `HTMLElement.prototype`
 *
 * Call once at the top of your test setup file:
 *
 * ```ts
 * // vitest.setup.ts
 * import { setupRunoxTests } from "@runox/ui/test";
 *
 * setupRunoxTests();
 * ```
 *
 * Idempotent: safe to call multiple times.
 */
export function setupRunoxTests(options: SetupRunoxTestsOptions = {}): void {
  const {
    skipMatchMedia = false,
    skipResizeObserver = false,
    skipPointerEvent = false,
    skipElementMocks = false,
    skipCleanup = false,
  } = options;

  if (!skipMatchMedia && typeof window !== "undefined") {
    const existing = window.matchMedia as unknown;
    // Only install if missing or not configurable by the consumer already.
    if (!existing || typeof existing !== "function" || isVitestMock(existing)) {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(), // Deprecated API
          removeListener: vi.fn(), // Deprecated API
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    }
  }

  if (!skipResizeObserver) {
    installResizeObserverStub();
  }

  if (
    !skipPointerEvent &&
    typeof window !== "undefined" &&
    !window.PointerEvent
  ) {
    class PointerEventPolyfill extends MouseEvent {
      public pointerId: number;
      public pointerType: string;
      public isPrimary: boolean;

      constructor(type: string, params: PointerEventInit = {}) {
        super(type, params);
        this.pointerId = params.pointerId ?? 0;
        this.pointerType = params.pointerType ?? "";
        this.isPrimary = params.isPrimary ?? false;
      }
    }
    window.PointerEvent =
      PointerEventPolyfill as unknown as typeof PointerEvent;
  }

  if (!skipElementMocks && typeof window !== "undefined") {
    window.HTMLElement.prototype.scrollIntoView =
      vi.fn() as unknown as typeof HTMLElement.prototype.scrollIntoView;
    window.HTMLElement.prototype.hasPointerCapture = vi.fn(
      () => false,
    ) as unknown as typeof HTMLElement.prototype.hasPointerCapture;
    window.HTMLElement.prototype.setPointerCapture =
      vi.fn() as unknown as typeof HTMLElement.prototype.setPointerCapture;
    window.HTMLElement.prototype.releasePointerCapture =
      vi.fn() as unknown as typeof HTMLElement.prototype.releasePointerCapture;
  }

  if (!skipCleanup) {
    afterEach(cleanup);
  }
}

function isVitestMock(fn: unknown): boolean {
  return (
    typeof fn === "function" &&
    "_isMockFunction" in fn &&
    (fn as { _isMockFunction?: boolean })._isMockFunction === true
  );
}

let resizeObserverInstalled = false;

function installResizeObserverStub(): void {
  if (resizeObserverInstalled) return;
  if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class ResizeObserverStub {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver;
    resizeObserverInstalled = true;
  }
}

// Re-export afterEach so consumers don't need a direct vitest import for the
// common "setup + cleanup" pattern.
export { afterEach } from "vitest";
