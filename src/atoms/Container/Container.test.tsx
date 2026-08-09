import { Box } from "../Box";
import React from "react";
import { render } from "@testing-library/react";
import { Container } from "./Container";

describe("Container", () => {
  it("renders correctly", () => {
    const { container } = render(
      <Container maxWidth="md">
        <Box>1</Box>
      </Container>
    );
    expect(container.firstChild).toHaveClass("rnx-container");
  });

  it("renders without centering", () => {
    const { container } = render(
      <Container center={false}>
        <Box>1</Box>
      </Container>
    );
    expect(container.firstChild).not.toHaveClass("rnx-container--center");
  });
});
