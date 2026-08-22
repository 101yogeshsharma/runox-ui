import { Box } from "../Box";
import React from "react";
import { render } from "@testing-library/react";
import { Grid } from "./Grid";
import { useBreakpoint } from "../../hooks/use-breakpoint";

vi.mock("../../hooks/use-breakpoint", () => ({
  useBreakpoint: vi.fn(),
}));

describe("Grid", () => {
  it("renders correctly with fixed columns", () => {
    vi.mocked(useBreakpoint).mockReturnValue("md");
    const { container } = render(
      <Grid cols={3}>
        <Box>1</Box>
      </Grid>
    );
    expect(container.firstChild).toHaveStyle({
      "--rnx-grid-cols-base": "repeat(3, minmax(0, 1fr))",
    });
  });

  it("renders responsive columns based on breakpoint", () => {
    vi.mocked(useBreakpoint).mockReturnValue("sm");
    const { container, rerender } = render(
      <Grid cols={{ xs: 1, sm: 2, lg: 4 }}>
        <Box>1</Box>
      </Grid>
    );
    expect(container.firstChild).toHaveStyle({
      "--rnx-grid-cols-sm": "repeat(2, minmax(0, 1fr))",
    });

    vi.mocked(useBreakpoint).mockReturnValue("lg");
    rerender(
      <Grid cols={{ xs: 1, sm: 2, lg: 4 }}>
        <Box>1</Box>
      </Grid>
    );
    expect(container.firstChild).toHaveStyle({
      "--rnx-grid-cols-lg": "repeat(4, minmax(0, 1fr))",
    });
  });

  it("renders autoFit grid", () => {
    vi.mocked(useBreakpoint).mockReturnValue("md");
    const { container } = render(
      <Grid autoFit minColWidth="150px">
        <Box>1</Box>
      </Grid>
    );
    expect(container.firstChild).toHaveStyle({
      "--rnx-grid-cols": "repeat(auto-fit, minmax(150px, 1fr))",
    });
  });
});
