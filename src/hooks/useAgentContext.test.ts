import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useAgentContext } from "./useAgentContext";

describe("useAgentContext", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    delete (window as typeof window & { __rnx_agent_context__?: unknown })
      .__rnx_agent_context__;
  });

  it("takes snapshots of tagged components and exposes them globally", () => {
    const component = document.createElement("button");
    component.id = "save-button";
    component.textContent = "Save";
    component.dataset.rnxComponent = "Button";
    component.dataset.rnxState = "active";
    document.body.appendChild(component);

    const { result } = renderHook(() => useAgentContext());
    act(() => result.current.refresh());

    expect(result.current.snapshot.components).toEqual([
      expect.objectContaining({
        id: "save-button",
        component: "Button",
        state: "active",
        textContent: "Save",
      }),
    ]);
    expect(window.__rnx_agent_context__).toEqual(result.current.snapshot);
  });
});
