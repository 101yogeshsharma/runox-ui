import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Text } from "./Text";

describe("Text presentation", () => {
  it("maps colors, weights, alignment, and tracking", () => {
    render(
      <Text color="brand" weight="bold" align="center" tracking="wide">
        Styled
      </Text>,
    );
    const element = screen.getByText("Styled");

    expect(element).toHaveClass("rnx-text--tracking-wide");
    expect(element.style.getPropertyValue("--rnx-text-color")).toBe(
      "var(--primary)",
    );
    expect(element.style.getPropertyValue("--rnx-text-fw")).toBe(
      "var(--fontWeight-bold)",
    );
    expect(element.style.getPropertyValue("--rnx-text-align")).toBe("center");
  });

  it("applies truncation, clamping, and emphasis modifiers", () => {
    render(
      <Text truncate maxLines={2} muted strong italic underline strikethrough>
        Clamped
      </Text>,
    );
    const element = screen.getByText("Clamped");

    expect(element.style.display).toBe("-webkit-box");
    expect(element.style.webkitLineClamp).toBe("2");
    expect(element).toHaveClass("rnx-text--muted");
    expect(element).toHaveClass("rnx-text--strong");
    expect(element).toHaveClass("rnx-text--italic");
    expect(element).toHaveClass("rnx-text--underline");
    expect(element).toHaveClass("rnx-text--strikethrough");
  });

  it("infers semantic elements and gradient rendering", () => {
    render(
      <Text as="code" gradient="primary">
        const x = 1;
      </Text>,
    );
    const code = screen.getByText("const x = 1;");

    expect(code.tagName).toBe("CODE");
    expect(code.style.getPropertyValue("--rnx-text-color")).toBe("transparent");
    expect(code).toHaveClass("rnx-text--gradient-primary");
  });
});
