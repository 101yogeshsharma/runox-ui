import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useScrollLock } from "./useScrollLock";

describe("useScrollLock", () => {
  beforeEach(() => {
    document.body.style.overflow = "auto";
  });

  it("locks and unlocks body scroll", () => {
    const { rerender, unmount } = renderHook(
      ({ active }) => useScrollLock(active),
      {
        initialProps: { active: true },
      },
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender({ active: false });
    expect(document.body.style.overflow).toBe("auto");

    // test cleanup logic for branches
    rerender({ active: true });
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });
});
