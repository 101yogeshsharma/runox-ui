import React from "react";
import { render } from "@testing-library/react";
import { FadeIn, ScaleIn, SlideIn, StaggerContainer, StaggerItem, LazyMotionProvider } from "./index";
import { describe, it, expect } from "vitest";

describe("Motion Components", () => {
  it("renders FadeIn with default props", () => {
    const { getByText } = render(
      <LazyMotionProvider>
        <FadeIn>Test Fade</FadeIn>
      </LazyMotionProvider>
    );
    expect(getByText("Test Fade")).toBeInTheDocument();
  });

  it("renders FadeIn with custom props", () => {
    const { getByText } = render(
      <LazyMotionProvider>
        <FadeIn duration={1} delay={0.5}>Test Fade</FadeIn>
      </LazyMotionProvider>
    );
    expect(getByText("Test Fade")).toBeInTheDocument();
  });

  it("renders ScaleIn with default props", () => {
    const { getByText } = render(
      <LazyMotionProvider>
        <ScaleIn>Test Scale</ScaleIn>
      </LazyMotionProvider>
    );
    expect(getByText("Test Scale")).toBeInTheDocument();
  });

  it("renders ScaleIn with custom props", () => {
    const { getByText } = render(
      <LazyMotionProvider>
        <ScaleIn duration={1} delay={0.5}>Test Scale</ScaleIn>
      </LazyMotionProvider>
    );
    expect(getByText("Test Scale")).toBeInTheDocument();
  });

  it("renders SlideIn with default props", () => {
    const { getByText } = render(
      <LazyMotionProvider>
        <SlideIn>Test Slide</SlideIn>
      </LazyMotionProvider>
    );
    expect(getByText("Test Slide")).toBeInTheDocument();
  });

  it("renders SlideIn with all directions", () => {
    const { getByText } = render(
      <LazyMotionProvider>
        <SlideIn direction="up">Up</SlideIn>
        <SlideIn direction="down">Down</SlideIn>
        <SlideIn direction="left">Left</SlideIn>
        <SlideIn direction="right">Right</SlideIn>
        <SlideIn direction="right" duration={1} delay={0.5} distance={50}>Custom</SlideIn>
      </LazyMotionProvider>
    );
    expect(getByText("Up")).toBeInTheDocument();
    expect(getByText("Down")).toBeInTheDocument();
    expect(getByText("Left")).toBeInTheDocument();
    expect(getByText("Right")).toBeInTheDocument();
    expect(getByText("Custom")).toBeInTheDocument();
  });

  it("renders StaggerContainer and StaggerItem with default props", () => {
    const { getByText } = render(
      <LazyMotionProvider>
        <StaggerContainer>
          <StaggerItem direction="up">Child 1</StaggerItem>
          <StaggerItem direction="down">Child 2</StaggerItem>
          <StaggerItem direction="left">Child 3</StaggerItem>
          <StaggerItem direction="right">Child 4</StaggerItem>
          <StaggerItem distance={50} direction={undefined as any}>Child 5</StaggerItem>
        </StaggerContainer>
      </LazyMotionProvider>
    );
    expect(getByText("Child 1")).toBeInTheDocument();
    expect(getByText("Child 2")).toBeInTheDocument();
    expect(getByText("Child 3")).toBeInTheDocument();
    expect(getByText("Child 4")).toBeInTheDocument();
    expect(getByText("Child 5")).toBeInTheDocument();
  });

  it("renders StaggerContainer with custom props", () => {
    const { getByText } = render(
      <LazyMotionProvider>
        <StaggerContainer staggerDelay={0.3} delayChildren={0.2}>
          <StaggerItem>Child 1</StaggerItem>
          <StaggerItem>Child 2</StaggerItem>
        </StaggerContainer>
      </LazyMotionProvider>
    );
    expect(getByText("Child 1")).toBeInTheDocument();
    expect(getByText("Child 2")).toBeInTheDocument();
  });
});
