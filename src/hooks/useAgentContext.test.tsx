import { describe, it, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import React from "react";
import { useAgentContext } from "./useAgentContext";

function Harness() {
  const { snapshot, refresh } = useAgentContext();
  return (
    <div>
      <span data-testid="count">{snapshot.components.length}</span>
      <span data-testid="ts">{snapshot.timestamp}</span>
      <button onClick={refresh} data-testid="refresh" />
    </div>
  );
}

describe("useAgentContext", () => {
  it("takes an initial snapshot and exposes it on window for headless agents", () => {
    render(
      <div data-rnx-component="Button" data-rnx-variant="solid">
        Submit
      </div>,
    );
    render(<Harness />);
    expect((window as any).__rnx_agent_context__).toBeTruthy();
    expect((window as any).__rnx_agent_context__.components.length).toBe(1);
  });

  it("captures component metadata from data-rnx-* attributes", () => {
    render(
      <div
        id="my-btn"
        data-rnx-component="Button"
        data-rnx-variant="outline"
        data-rnx-state="hover"
        data-rnx-action="click"
      >
        Label text here
      </div>,
    );
    const { snapshot } = (function useIt() {
      let captured: any;
      function Inner() {
        captured = useAgentContext();
        return null;
      }
      render(<Inner />);
      return { snapshot: captured.snapshot };
    })();

    const comp = snapshot.components.find((c: any) => c.id === "my-btn");
    expect(comp).toBeTruthy();
    expect(comp.component).toBe("Button");
    expect(comp.variant).toBe("outline");
    expect(comp.state).toBe("hover");
    expect(comp.action).toBe("click");
    expect(comp.textContent).toBe("Label text here");
    expect(comp.bounds).toHaveProperty("width");
  });

  it("truncates long text content to 100 characters", () => {
    const long = "x".repeat(300);
    render(<div data-rnx-component="Text">{long}</div>);
    // Trigger a fresh snapshot via a harness refresh
    render(<Harness />);
    fireEvent.click(screen.getByTestId("refresh"));
    const ctx = (window as any).__rnx_agent_context__;
    const comp = ctx.components.find((c: any) => c.component === "Text");
    expect(comp.textContent.length).toBeLessThanOrEqual(100);
  });

  it("refresh() produces a new timestamped snapshot", async () => {
    vi.useFakeTimers();
    let now = 1_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);

    function Probe() {
      const { snapshot, refresh } = useAgentContext();
      return (
        <div>
          <span data-testid="ts">{snapshot.timestamp}</span>
          <button onClick={refresh} data-testid="refresh" />
        </div>
      );
    }
    const { getByTestId } = render(<Probe />);
    const first = getByTestId("ts").textContent;

    now = 1_000_500;
    act(() => {
      fireEvent.click(getByTestId("refresh"));
    });
    expect(getByTestId("ts").textContent).not.toBe(first);

    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("generates fallback ids when element has no id and crypto is unavailable", () => {
    const originalCrypto = globalThis.crypto;
    // @ts-expect-error simulate absence of crypto.randomUUID
    delete globalThis.crypto;
    try {
      render(<div data-rnx-component="Badge">b</div>);
      render(<Harness />);
      fireEvent.click(screen.getByTestId("refresh"));
      const ctx = (window as any).__rnx_agent_context__;
      const comp = ctx.components.find((c: any) => c.component === "Badge");
      expect(comp.id).toMatch(/^rnx-\d+-\d+$/);
    } finally {
      globalThis.crypto = originalCrypto;
    }
  });
});
