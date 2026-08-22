import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VirtualList } from "./VirtualList";

describe("VirtualList", () => {
  it("rejects non-positive item heights", () => {
    expect(() =>
      render(
        <VirtualList
          items={["item"]}
          itemHeight={0}
          renderItem={(item) => item}
        />,
      ),
    ).toThrow("itemHeight must be a finite number greater than zero");
  });

  it("renders the initial virtual window with stable geometry", () => {
    const { container } = render(
      <VirtualList
        items={["first", "second"]}
        itemHeight={40}
        height={100}
        renderItem={(item) => item}
      />,
    );

    expect(container.querySelectorAll(".rnx-virtual-list-item")).toHaveLength(
      2,
    );
    expect(
      container.querySelector(".rnx-virtual-list > .relative.w-full"),
    ).toHaveStyle({
      height: "80px",
    });
  });
});
