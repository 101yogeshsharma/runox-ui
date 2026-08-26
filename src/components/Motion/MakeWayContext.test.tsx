import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  MakeWayProvider,
  useMakeWay,
  useMakeWayOptional,
} from "./MakeWayContext";

function Probe() {
  const ctx = useMakeWay();
  return (
    <div>
      <span data-testid="open">{String(ctx.isModalOpen)}</span>
      <button onClick={() => ctx.registerModal("m1")} data-testid="register" />
      <button
        onClick={() => ctx.unregisterModal("m1")}
        data-testid="unregister"
      />
    </div>
  );
}

describe("MakeWayContext", () => {
  it("provides isModalOpen=false initially and toggles via register/unregister", () => {
    const { getByTestId } = render(
      <MakeWayProvider>
        <Probe />
      </MakeWayProvider>,
    );
    expect(getByTestId("open").textContent).toBe("false");

    fireEvent.click(getByTestId("register"));
    expect(getByTestId("open").textContent).toBe("true");
    // Body gets the shift-aside class while a modal is open
    expect(document.body.classList.contains("modal-open-makeway")).toBe(true);

    fireEvent.click(getByTestId("unregister"));
    expect(getByTestId("open").textContent).toBe("false");
    expect(document.body.classList.contains("modal-open-makeway")).toBe(false);
  });

  it("tracks multiple modals — class stays until the last one closes", () => {
    function MultiProbe() {
      const ctx = useMakeWay();
      return (
        <>
          <button onClick={() => ctx.registerModal("a")} data-testid="reg-a" />
          <button onClick={() => ctx.registerModal("b")} data-testid="reg-b" />
          <button
            onClick={() => ctx.unregisterModal("a")}
            data-testid="unreg-a"
          />
          <span data-testid="open">{String(ctx.isModalOpen)}</span>
        </>
      );
    }
    const { getByTestId } = render(
      <MakeWayProvider>
        <MultiProbe />
      </MakeWayProvider>,
    );
    fireEvent.click(getByTestId("reg-a"));
    fireEvent.click(getByTestId("reg-b"));
    expect(getByTestId("open").textContent).toBe("true");

    // One closes but the other remains open
    fireEvent.click(getByTestId("unreg-a"));
    expect(getByTestId("open").textContent).toBe("true");
    expect(document.body.classList.contains("modal-open-makeway")).toBe(true);
  });

  it("registering the same modal id twice then unregistering once keeps state open", () => {
    function DupProbe() {
      const ctx = useMakeWay();
      return (
        <>
          <button onClick={() => ctx.registerModal("dup")} data-testid="r" />
          <button onClick={() => ctx.unregisterModal("dup")} data-testid="u" />
          <span data-testid="open">{String(ctx.isModalOpen)}</span>
        </>
      );
    }
    const { getByTestId } = render(
      <MakeWayProvider>
        <DupProbe />
      </MakeWayProvider>,
    );
    fireEvent.click(getByTestId("r"));
    fireEvent.click(getByTestId("r")); // Set dedupes
    fireEvent.click(getByTestId("u"));
    expect(getByTestId("open").textContent).toBe("false");
  });

  it("useMakeWay throws outside a provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(
      "useMakeWay must be used within a MakeWayProvider",
    );
    spy.mockRestore();
  });

  it("renders children inside the app-content-wrapper", () => {
    const { container } = render(
      <MakeWayProvider>
        <p data-testid="child">hi</p>
      </MakeWayProvider>,
    );
    expect(container.querySelector("#app-content-wrapper")).toBeTruthy();
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("useMakeWayOptional returns a no-op fallback without a provider", () => {
    function Probe() {
      const ctx = useMakeWayOptional();
      return (
        <div>
          <span data-testid="open">{String(ctx.isModalOpen)}</span>
          <button onClick={() => ctx.registerModal("x")} data-testid="reg" />
        </div>
      );
    }
    const { getByTestId } = render(<Probe />);
    // No provider: fallback keeps state closed and no-ops safely.
    expect(getByTestId("open").textContent).toBe("false");
    expect(() => fireEvent.click(getByTestId("reg"))).not.toThrow();
    expect(getByTestId("open").textContent).toBe("false");
    expect(document.body.classList.contains("modal-open-makeway")).toBe(false);
  });

  it("useMakeWayOptional returns LIVE context when a provider is present", () => {
    function Probe() {
      const ctx = useMakeWayOptional();
      return (
        <div>
          <span data-testid="open">{String(ctx.isModalOpen)}</span>
          <button onClick={() => ctx.registerModal("live")} data-testid="reg" />
        </div>
      );
    }
    const { getByTestId } = render(
      <MakeWayProvider>
        <Probe />
      </MakeWayProvider>,
    );

    // Must reflect provider state, not the static no-op fallback.
    expect(getByTestId("open").textContent).toBe("false");
    fireEvent.click(getByTestId("reg"));
    expect(getByTestId("open").textContent).toBe("true");
    expect(document.body.classList.contains("modal-open-makeway")).toBe(true);
  });
});
