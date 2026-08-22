import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeProvider";

function Probe() {
  const { theme, config } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="color">{config.primaryColor}</span>
    </div>
  );
}

describe("ThemeProvider resilience", () => {
  it("ignores malformed persisted configuration", () => {
    window.localStorage.setItem(
      "runox-ui-theme",
      JSON.stringify({ theme: "neon", radius: "gigantic", density: "dense" }),
    );

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme").textContent).toBe("system");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("switches between named and hex colors without stale attributes", () => {
    render(
      <ThemeProvider defaultConfig={{ primaryColor: "#00ff00" }}>
        <Probe />
      </ThemeProvider>,
    );

    expect(document.documentElement.style.getPropertyValue("--primary")).toBe(
      "#00ff00",
    );
    expect(document.documentElement).not.toHaveAttribute("data-color");
    expect(screen.getByTestId("color").textContent).toBe("#00ff00");
  });
});
