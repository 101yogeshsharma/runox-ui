import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { withLoading } from "./withLoading";

function Base({
  label,
  className,
  ...rest
}: {
  label: string;
  className?: string;
} & Record<string, any>) {
  return (
    <button className={className} {...rest}>
      {label}
    </button>
  );
}

describe("withLoading HOC", () => {
  it("renders the wrapped component normally when isLoading is false/undefined", () => {
    const Wrapped = withLoading(Base);
    render(<Wrapped label="Click me" />);
    const btn = screen.getByText("Click me");
    expect(btn.className).not.toContain("rnx-is-loading");
    expect(btn.getAttribute("data-loading")).toBeNull();
    expect(btn.getAttribute("aria-busy")).toBeNull();
  });

  it("adds shimmer class, data-loading, and aria-busy when loading without a skeleton", () => {
    const Wrapped = withLoading(Base);
    render(<Wrapped label="Click me" isLoading />);
    const btn = screen.getByText("Click me");
    expect(btn.className).toContain("rnx-is-loading");
    expect(btn.getAttribute("data-loading")).toBe("true");
    expect(btn.getAttribute("aria-busy")).toBe("true");
  });

  it("merges the wrapped component's className with the loading class", () => {
    const Wrapped = withLoading(Base);
    render(<Wrapped label="x" className="my-custom" isLoading />);
    expect(screen.getByText("x").className).toContain("my-custom");
    expect(screen.getByText("x").className).toContain("rnx-is-loading");
  });

  it("renders the SkeletonComponent instead when provided and loading", () => {
    function Skeleton({ label }: { label: string }) {
      return <div data-testid="skeleton">{label}</div>;
    }
    const Wrapped = withLoading(Base, Skeleton);
    const { container } = render(<Wrapped label="skeleton-label" isLoading />);
    expect(screen.getByTestId("skeleton")).toBeTruthy();
    // The wrapped component (a <button>) is not rendered while loading
    expect(container.querySelector("button")).toBeNull();
  });

  it("preserves displayName for DevTools", () => {
    function Named() {
      return null;
    }
    Named.displayName = "Fancy";
    expect(withLoading(Named).displayName).toBe("withLoading(Fancy)");
  });

  it("falls back to the function name when displayName is absent", () => {
    function MyWidget() {
      return null;
    }
    expect(withLoading(MyWidget).displayName).toBe("withLoading(MyWidget)");
  });

  it("forwards refs to the wrapped component (forwardRef-wrapped base)", () => {
    const ForwardedBase = React.forwardRef<
      HTMLButtonElement,
      { label: string } & Record<string, any>
    >(({ label, ...rest }, ref) => (
      <button ref={ref} {...rest}>
        {label}
      </button>
    ));
    ForwardedBase.displayName = "ForwardedBase";

    const Wrapped = withLoading(ForwardedBase);
    let ref: any = null;
    render(<Wrapped ref={(r: any) => (ref = r)} label="ref-test" />);
    expect(ref).toBeTruthy();
    expect(ref.tagName).toBe("BUTTON");
  });

  it("does not pass isLoading down to the wrapped component", () => {
    const spy = vi.fn(({ label }: any) => <button>{label}</button>);
    const Wrapped = withLoading(spy as any);
    render(<Wrapped label="x" isLoading />);
    const arg = spy.mock.calls[0][0];
    expect(arg).not.toHaveProperty("isLoading");
  });
});
