import { Box } from "../Box";
import React from "react";
import { render } from "@testing-library/react";
import { Flex } from "./Flex";

describe("Flex", () => {
  it("renders correctly with default props", () => {
    const { container } = render(
      <Flex>
        <Box>1</Box>
      </Flex>
    );
    expect(container.firstChild).toHaveClass("rnx-flex");
    expect(container.firstChild).toHaveStyle({ "--rnx-flex-dir-base": "row" });
  });

  it("renders as different element", () => {
    const { container } = render(
      <Flex as="section">
        <Box>1</Box>
      </Flex>
    );
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("applies justify and align props", () => {
    const { container } = render(
      <Flex justify="between" align="center">
        <Box>1</Box>
      </Flex>
    );
    expect(container.firstChild).toHaveStyle({
      "--rnx-flex-justify": "space-between",
    });
    expect(container.firstChild).toHaveStyle({ "--rnx-flex-align": "center" });
  });
});
