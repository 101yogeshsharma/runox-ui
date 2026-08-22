import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "./ThemeProvider";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

const TestComponent = () => {
  const { theme, setTheme, config, setConfig } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="primary-color">{config.primaryColor}</span>
      <span data-testid="radius">{config.radius}</span>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setConfig({ primaryColor: "#ff0000" })}>Set Color</button>
      <button onClick={() => setConfig({ radius: "xl" })}>Set Radius</button>
    </div>
  );
};

describe("ThemeProvider", () => {
  let matchMediaMock: any;

  beforeEach(() => {
    window.localStorage.clear();
    
    // Mock window.matchMedia
    matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
    
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-color");
    document.documentElement.style.cssText = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return default config if useTheme is used outside provider", () => {
    render(<TestComponent />);
    expect(screen.getByTestId("theme").textContent).toBe("system");
    expect(screen.getByTestId("primary-color").textContent).toBe("blue");
  });

  it("should initialize with default system config", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId("theme").textContent).toBe("system");
    expect(screen.getByTestId("primary-color").textContent).toBe("blue");
    expect(screen.getByTestId("radius").textContent).toBe("md");
    
    // By default matchMedia resolves to false (light)
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-color")).toBe("blue");
  });

  it("should initialize with dark system config when prefers-color-scheme is dark", () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should allow changing the theme", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    await user.click(screen.getByText("Set Dark"));
    
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should save configuration to localStorage", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider storageKey="test-theme-key">
        <TestComponent />
      </ThemeProvider>
    );
    
    await user.click(screen.getByText("Set Dark"));
    
    const stored = JSON.parse(window.localStorage.getItem("test-theme-key") || "{}");
    expect(stored.theme).toBe("dark");
  });

  it("should hydrate from localStorage", () => {
    window.localStorage.setItem(
      "runox-ui-theme",
      JSON.stringify({ theme: "light", primaryColor: "blue", radius: "none" })
    );
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(screen.getByTestId("primary-color").textContent).toBe("blue");
    expect(screen.getByTestId("radius").textContent).toBe("none");
    
    expect(document.documentElement.style.getPropertyValue("--radius")).toBe("0px");
  });

  it("should apply custom hex color", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    await user.click(screen.getByText("Set Color"));
    
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe("#ff0000");
    // #ff0000 is red, which has low/mid luminosity, so foreground should be calculated
    expect(document.documentElement.style.getPropertyValue("--primary-foreground")).toBeTruthy();
  });
  
  it("should handle 3-character hex colors", async () => {
    render(
      <ThemeProvider defaultConfig={{ primaryColor: "#f00" }}>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe("#f00");
  });

  it("should change radius CSS variable", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    await user.click(screen.getByText("Set Radius"));
    
    expect(document.documentElement.style.getPropertyValue("--radius")).toBe("var(--radius-xl)");
  });

  it("should handle storage event / OS theme change listener", () => {
    const addEventListener = vi.fn();
    matchMediaMock.mockImplementation(() => ({
      matches: false,
      addEventListener,
      removeEventListener: vi.fn(),
    }));

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    
    // Simulate OS theme change to dark
    const listener = addEventListener.mock.calls[0][1];
    act(() => {
      listener({ matches: true });
    });
    
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
