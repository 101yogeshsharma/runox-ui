import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Flex } from "./Flex";

describe("Flex layout options", () => {
  it("applies responsive direction and gap variables", () => {
    const { container } = render(
      <Flex direction={{ base: "row", md: "col" }} gap={{ sm: "lg" }} />,
    );

    expect(container.firstChild).toHaveStyle({
      "--rnx-flex-dir-base": "row",
      "--rnx-flex-dir-md": "column",
      "--rnx-flex-gap-sm": "calc(1.5rem * var(--rnx-space-scale, 1))",
    });
  });

  it("supports wrap, reverse wrap, inline, and full-width modes", () => {
    const { container } = render(
      <Flex wrap="reverse" inline fullWidth p="sm" px="md" py="xs" />,
    );

    expect(container.firstChild).toHaveStyle({
      "--rnx-flex-wrap": "wrap-reverse",
      "--rnx-flex-display": "inline-flex",
      width: "100%",
      "--rnx-flex-p-base": "calc(0.5rem * var(--rnx-space-scale, 1))",
      "--rnx-flex-px-base": "calc(1rem * var(--rnx-space-scale, 1))",
      "--rnx-flex-py-base": "calc(0.25rem * var(--rnx-space-scale, 1))",
    });
  });
});
