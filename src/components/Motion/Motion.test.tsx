import React from "react";
import { render } from "@testing-library/react";
import { Motion } from "./index";
import { describe, it, expect } from "vitest";

describe("Motion Components", () => {
  it("renders Motion.FadeIn with default props", () => {
    const { getByText } = render(<Motion.FadeIn>Test Fade</Motion.FadeIn>);
    expect(getByText("Test Fade")).toBeInTheDocument();
  });

  it("renders Motion.FadeIn with custom props", () => {
    const { getByText } = render(
      <Motion.FadeIn duration={1} delay={0.5}>
        Test Fade
      </Motion.FadeIn>,
    );
    expect(getByText("Test Fade")).toBeInTheDocument();
  });

  it("renders Motion.ScaleIn with default props", () => {
    const { getByText } = render(<Motion.ScaleIn>Test Scale</Motion.ScaleIn>);
    expect(getByText("Test Scale")).toBeInTheDocument();
  });

  it("renders Motion.ScaleIn with custom props", () => {
    const { getByText } = render(
      <Motion.ScaleIn duration={1} delay={0.5}>
        Test Scale
      </Motion.ScaleIn>,
    );
    expect(getByText("Test Scale")).toBeInTheDocument();
  });

  it("renders Motion.SlideIn with default props", () => {
    const { getByText } = render(<Motion.SlideIn>Test Slide</Motion.SlideIn>);
    expect(getByText("Test Slide")).toBeInTheDocument();
  });

  it("renders Motion.SlideIn with all directions", () => {
    const { getByText } = render(
      <>
        <Motion.SlideIn direction="up">Up</Motion.SlideIn>
        <Motion.SlideIn direction="down">Down</Motion.SlideIn>
        <Motion.SlideIn direction="left">Left</Motion.SlideIn>
        <Motion.SlideIn direction="right">Right</Motion.SlideIn>
        <Motion.SlideIn
          direction="right"
          duration={1}
          delay={0.5}
          distance={50}
        >
          Custom
        </Motion.SlideIn>
      </>,
    );
    expect(getByText("Up")).toBeInTheDocument();
    expect(getByText("Down")).toBeInTheDocument();
    expect(getByText("Left")).toBeInTheDocument();
    expect(getByText("Right")).toBeInTheDocument();
    expect(getByText("Custom")).toBeInTheDocument();
  });

  it("renders Motion.Stagger and Motion.StaggerItem with default props", () => {
    const { getByText } = render(
      <Motion.Stagger>
        <Motion.StaggerItem direction="up">Child 1</Motion.StaggerItem>
        <Motion.StaggerItem direction="down">Child 2</Motion.StaggerItem>
        <Motion.StaggerItem direction="left">Child 3</Motion.StaggerItem>
        <Motion.StaggerItem direction="right">Child 4</Motion.StaggerItem>
        <Motion.StaggerItem distance={50} direction={undefined as any}>
          Child 5
        </Motion.StaggerItem>
      </Motion.Stagger>,
    );
    expect(getByText("Child 1")).toBeInTheDocument();
    expect(getByText("Child 2")).toBeInTheDocument();
    expect(getByText("Child 3")).toBeInTheDocument();
    expect(getByText("Child 4")).toBeInTheDocument();
    expect(getByText("Child 5")).toBeInTheDocument();
  });

  it("renders Motion.Stagger with custom props", () => {
    const { getByText } = render(
      <Motion.Stagger staggerDelay={0.3} delayChildren={0.2}>
        <Motion.StaggerItem>Child 1</Motion.StaggerItem>
        <Motion.StaggerItem>Child 2</Motion.StaggerItem>
      </Motion.Stagger>,
    );
    expect(getByText("Child 1")).toBeInTheDocument();
    expect(getByText("Child 2")).toBeInTheDocument();
  });
});
