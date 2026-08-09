import React from "react";
import { render } from "@testing-library/react";
import { Text } from "./Text";

describe("Text", () => {
  it("renders default body paragraph", () => {
    const { getByText, container } = render(<Text>Hello World</Text>);
    expect(getByText("Hello World")).toBeInTheDocument();
    expect(container.querySelector("p")).toBeInTheDocument();
  });

  it("renders correctly as h1", () => {
    const { container } = render(<Text variant="h1">Heading</Text>);
    expect(container.querySelector("h1")).toBeInTheDocument();
  });

  it("allows overriding the element type", () => {
    const { container } = render(
      <Text variant="h1" as="div">
        Heading as Div
      </Text>
    );
    expect(container.querySelector("div")).toBeInTheDocument();
    expect(container.querySelector("h1")).not.toBeInTheDocument();
  });

  it("applies truncation style", () => {
    const { getByText } = render(<Text truncate>Truncate me</Text>);
    const element = getByText("Truncate me");
    expect(element.style.textOverflow).toBe("ellipsis");
  });

  it("applies maxLines style", () => {
    const { getByText } = render(<Text maxLines={2}>Max lines</Text>);
    const element = getByText("Max lines");
    expect(element.style.WebkitLineClamp).toBe("2");
  });
});
