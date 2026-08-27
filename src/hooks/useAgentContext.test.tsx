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

  it("maintains stable element IDs across multiple snapshot refreshes", () => {
    render(<button data-rnx-component="Button">Click Me</button>);
    render(<Harness />);
    const firstCtx = (window as any).__rnx_agent_context__;
    const firstId = firstCtx.components[0].id;
    expect(firstId).toBeTruthy();

    fireEvent.click(screen.getByTestId("refresh"));
    const secondCtx = (window as any).__rnx_agent_context__;
    const secondId = secondCtx.components[0].id;
    expect(secondId).toBe(firstId);
  });

  it("captures overlay attribute when data-rnx-overlay is present", () => {
    render(
      <div data-rnx-component="Modal" data-rnx-overlay="true">
        Modal Content
      </div>,
    );
    render(<Harness />);
    const ctx = (window as any).__rnx_agent_context__;
    const comp = ctx.components.find((c: any) => c.component === "Modal");
    expect(comp.overlay).toBe(true);
  });

  it("captures input values and placeholders while masking passwords", () => {
    render(
      <div>
        <input
          data-rnx-component="Input"
          placeholder="Enter name"
          defaultValue="John Doe"
        />
        <input
          type="password"
          data-rnx-component="PasswordInput"
          defaultValue="secret_password123"
        />
      </div>,
    );
    render(<Harness />);
    const ctx = (window as any).__rnx_agent_context__;
    const textInput = ctx.components.find((c: any) => c.component === "Input");
    const passwordInput = ctx.components.find(
      (c: any) => c.component === "PasswordInput",
    );

    expect(textInput.textContent).toBe("John Doe");
    expect(passwordInput.textContent).toBe("");
  });

  it("never leaks passwords even when password reveal toggles type to text", () => {
    render(
      <div data-rnx-component="PasswordInput">
        <input
          data-rnx-component="Input"
          type="text"
          defaultValue="my_super_secret_pw"
        />
      </div>,
    );
    render(<Harness />);
    const ctx = (window as any).__rnx_agent_context__;
    const innerInput = ctx.components.find((c: any) => c.component === "Input");
    expect(innerInput.textContent).toBe("");
  });

  it("masks OTP inputs, credit card autocomplete, and data-rnx-sensitive inputs", () => {
    render(
      <div>
        <input data-rnx-component="OtpInput" defaultValue="123456" />
        <input
          data-rnx-component="Input"
          autoComplete="cc-number"
          defaultValue="4111222233334444"
        />
        <input
          data-rnx-component="Input"
          type="email"
          defaultValue="user@example.com"
        />
        <input
          data-rnx-component="Input"
          type="tel"
          defaultValue="+1234567890"
        />
        <input
          data-rnx-component="Input"
          autoComplete="street-address"
          defaultValue="123 Main St"
        />
        <input
          data-rnx-component="Input"
          name="full_name"
          defaultValue="Jane Doe"
        />
        <input
          data-rnx-component="Input"
          data-rnx-sensitive="true"
          defaultValue="my-secret-api-key"
        />
        <div data-rnx-sensitive="true">
          <input
            data-rnx-component="Input"
            defaultValue="nested-confidential-data"
          />
        </div>
      </div>,
    );
    render(<Harness />);
    const ctx = (window as any).__rnx_agent_context__;
    const otp = ctx.components.find((c: any) => c.component === "OtpInput");
    const inputs = ctx.components.filter((c: any) => c.component === "Input");

    expect(otp.textContent).toBe("");
    expect(inputs.every((i: any) => i.textContent === "")).toBe(true);
  });

  it("accurately reflects error and overlay states across components", () => {
    render(
      <div>
        <div data-rnx-component="Image" data-rnx-state="error">
          Broken img
        </div>
        <div
          data-rnx-component="Dropdown"
          data-rnx-overlay="true"
          data-rnx-state="open"
        >
          Menu
        </div>
        <div
          data-rnx-component="ContextMenu"
          data-rnx-overlay="true"
          data-rnx-state="open"
        >
          Context Menu
        </div>
        <div
          data-rnx-component="Select"
          data-rnx-overlay="true"
          data-rnx-state="open"
        >
          Select Listbox
        </div>
        <div
          data-rnx-component="AIInput"
          data-rnx-variant="glass"
          data-rnx-action="submit"
        >
          AI Prompt
        </div>
        <div data-rnx-component="ChatBubble" data-rnx-state="assistant">
          Hello
        </div>
        <div data-rnx-component="FormMessage" data-rnx-state="error">
          Required
        </div>
        <div data-rnx-component="Resizable" data-rnx-variant="horizontal">
          Panels
        </div>
        <div
          data-rnx-component="ErrorBoundary"
          data-rnx-state="error"
          data-rnx-action="retry"
        >
          Error
        </div>
        <div data-rnx-component="Tabs" data-rnx-variant="pills">
          Tabs
        </div>
      </div>,
    );
    render(<Harness />);
    const ctx = (window as any).__rnx_agent_context__;

    const img = ctx.components.find((c: any) => c.component === "Image");
    expect(img.state).toBe("error");

    const dropdown = ctx.components.find(
      (c: any) => c.component === "Dropdown",
    );
    expect(dropdown.overlay).toBe(true);
    expect(dropdown.state).toBe("open");

    const contextMenu = ctx.components.find(
      (c: any) => c.component === "ContextMenu",
    );
    expect(contextMenu.overlay).toBe(true);
    expect(contextMenu.state).toBe("open");

    const select = ctx.components.find((c: any) => c.component === "Select");
    expect(select.overlay).toBe(true);
    expect(select.state).toBe("open");

    const aiInput = ctx.components.find((c: any) => c.component === "AIInput");
    expect(aiInput.action).toBe("submit");
    expect(aiInput.variant).toBe("glass");

    const chat = ctx.components.find((c: any) => c.component === "ChatBubble");
    expect(chat.state).toBe("assistant");

    const formMsg = ctx.components.find(
      (c: any) => c.component === "FormMessage",
    );
    expect(formMsg.state).toBe("error");

    const resizable = ctx.components.find(
      (c: any) => c.component === "Resizable",
    );
    expect(resizable.variant).toBe("horizontal");

    const errorBoundary = ctx.components.find(
      (c: any) => c.component === "ErrorBoundary",
    );
    expect(errorBoundary.state).toBe("error");
    expect(errorBoundary.action).toBe("retry");

    const tabs = ctx.components.find((c: any) => c.component === "Tabs");
    expect(tabs.variant).toBe("pills");
  });
});
