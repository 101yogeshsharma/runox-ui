import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Motion } from "./index";

const {
  FadeIn,
  ScaleIn,
  SlideIn,
  ZoomIn,
  FlipIn,
  BounceIn,
  RotateIn,
  Shake,
  Reveal,
  Stagger: StaggerContainer,
  StaggerItem,
} = Motion;

describe("Motion animation components", () => {
  it.each([
    ["FadeIn", FadeIn, "rnx-motion-fade-in"],
    ["ScaleIn", ScaleIn, "rnx-motion-scale-in"],
    ["SlideIn", SlideIn, "rnx-motion-slide-up"],
    ["ZoomIn", ZoomIn, "rnx-motion-zoom-in"],
    ["FlipIn", FlipIn, "rnx-motion-flip-x"],
    ["BounceIn", BounceIn, "rnx-motion-bounce-up"],
    ["RotateIn", RotateIn, "rnx-motion-rotate-in"],
    ["Shake", Shake, "rnx-motion-shake"],
  ])("%s renders children with its animation class", (_name, Comp, cls) => {
    render(<Comp data-testid="el">Hello</Comp>);
    const el = screen.getByTestId("el");
    expect(el).toBeTruthy();
    expect(el.className).toContain(cls);
    expect(el.textContent).toBe("Hello");
  });

  it("FlipIn supports the y axis", () => {
    render(
      <FlipIn axis="y" data-testid="el">
        x
      </FlipIn>,
    );
    expect(screen.getByTestId("el").className).toContain("rnx-motion-flip-y");
  });

  it.each([
    ["down", "rnx-motion-bounce-down"],
    ["left", "rnx-motion-bounce-left"],
    ["right", "rnx-motion-bounce-right"],
  ])("BounceIn supports direction %s", (dir, cls) => {
    render(
      <BounceIn direction={dir as any} distance={10} data-testid="el">
        x
      </BounceIn>,
    );
    const el = screen.getByTestId("el") as HTMLElement;
    expect(el.className).toContain(cls);
    expect(el.style.getPropertyValue("--rnx-slide-distance")).toBe("10px");
  });

  it("FadeIn applies duration and delay styles", () => {
    render(
      <FadeIn duration={1.5} delay={0.25} data-testid="el">
        x
      </FadeIn>,
    );
    const el = screen.getByTestId("el") as HTMLElement;
    expect(el.style.animationDuration).toBe("1.5s");
    expect(el.style.animationDelay).toBe("0.25s");
  });

  it("components forward refs and spread DOM props", () => {
    let ref: HTMLElement | null = null;
    render(
      <FadeIn
        ref={(r: HTMLElement) => (ref = r)}
        aria-label="animated"
        data-testid="el"
      >
        x
      </FadeIn>,
    );
    expect(ref).toBeTruthy();
    expect(ref!.getAttribute("aria-label")).toBe("animated");
  });

  it("components render through a custom `as` element", () => {
    render(
      <FadeIn as="section" data-testid="el">
        x
      </FadeIn>,
    );
    expect(screen.getByTestId("el").tagName).toBe("SECTION");
  });

  it("Reveal applies direction classes for all four directions", () => {
    const cases: [string, string][] = [
      ["up", "rnx-motion-reveal-up"],
      ["down", "rnx-motion-reveal-down"],
      ["left", "rnx-motion-reveal-left"],
      ["right", "rnx-motion-reveal-right"],
    ];
    for (const [dir, cls] of cases) {
      const { unmount } = render(
        <Reveal direction={dir as any} data-testid="el">
          x
        </Reveal>,
      );
      expect(screen.getByTestId("el").className).toContain(cls);
      unmount();
    }
  });

  it("Reveal applies duration and delay styles", () => {
    render(
      <Reveal duration={2} delay={0.5} data-testid="el">
        x
      </Reveal>,
    );
    const el = screen.getByTestId("el") as HTMLElement;
    expect(el.style.animationDuration).toBe("2s");
    expect(el.style.animationDelay).toBe("0.5s");
  });

  it.each([
    ["sm", "4px"],
    ["md", "8px"],
    ["lg", "16px"],
  ])("Shake maps intensity %s to %s", (intensity, expected) => {
    render(
      <Shake intensity={intensity as any} data-testid="el">
        x
      </Shake>,
    );
    const el = screen.getByTestId("el") as HTMLElement;
    expect(el.style.getPropertyValue("--rnx-shake-intensity")).toBe(expected);
  });

  it("StaggerContainer injects staggered animation delays into children", () => {
    render(
      <StaggerContainer staggerDelay={0.2} delayChildren={0.1}>
        <FadeIn data-testid="a" />
        <FadeIn data-testid="b" />
        <span data-testid="c">not-element-skipped-ok</span>
      </StaggerContainer>,
    );
    const a = screen.getByTestId("a") as HTMLElement;
    const b = screen.getByTestId("b") as HTMLElement;
    expect(a.style.animationDelay).toBe("0.1s");
    expect(b.style.animationDelay).toBe("0.30000000000000004s");
  });

  it("StaggerContainer preserves existing child style and skips invalid elements", () => {
    render(
      <StaggerContainer staggerDelay={0}>
        <FadeIn data-testid="a" />
        {"plain string child"}
        {null}
      </StaggerContainer>,
    );
    const a = screen.getByTestId("a") as HTMLElement;
    expect(a.style.animationDelay).toBe("0s");
    expect(a.textContent).toBe("");
  });

  it("StaggerItem applies direction class and slide distance", () => {
    render(
      <StaggerItem direction="left" distance={40} duration={1} data-testid="el">
        x
      </StaggerItem>,
    );
    const el = screen.getByTestId("el") as HTMLElement;
    expect(el.className).toContain("rnx-motion-slide-left");
    expect(el.style.getPropertyValue("--rnx-slide-distance")).toBe("40px");
    expect(el.style.animationDuration).toBe("1s");
  });

  it("Motion namespace exposes all members", () => {
    expect(Motion.FadeIn).toBe(FadeIn);
    expect(Motion.Stagger).toBe(StaggerContainer);
    expect(Motion.StaggerItem).toBe(StaggerItem);
    expect(typeof Motion.MakeWayProvider).toBe("function");
    expect(typeof Motion.useMakeWay).toBe("function");
  });
});
