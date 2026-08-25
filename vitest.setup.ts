import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { toHaveNoViolations } from "jest-axe";

import { setupRunoxTests } from "./src/test/setup";

// Extend vitest's expect with testing-library and jest-axe matchers
expect.extend(matchers as any);
expect.extend(toHaveNoViolations);

// Install the shared browser-environment shims (matchMedia, ResizeObserver,
// PointerEvent, scrollIntoView / pointer-capture mocks) + RTL cleanup.
setupRunoxTests();
