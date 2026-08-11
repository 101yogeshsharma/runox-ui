import { render, fireEvent } from "@testing-library/react";
import { Image } from "./Image";
import { describe, it, expect, vi } from "vitest";

describe("Image", () => {
  it("renders correctly in loading state initially", () => {
    const { container, getByRole } = render(<Image src="test.jpg" alt="test image" />);
    // Initial state is loading, so it shows the pulse box
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    
    // The actual image is still in DOM but with opacity-0
    const img = getByRole("img");
    expect(img).toHaveAttribute("src", "test.jpg");
    expect(img).toHaveClass("opacity-0");
  });

  it("shows blur placeholder if blurDataURL is provided", () => {
    const { getAllByRole } = render(
      <Image src="test.jpg" alt="test image" blurDataURL="data:image/jpeg;base64,123" />
    );
    
    // One for the placeholder, one for the actual image
    const images = getAllByRole("img", { hidden: true });
    expect(images[0]).toHaveAttribute("src", "data:image/jpeg;base64,123");
    expect(images[0]).toHaveClass("blur-md");
  });

  it("updates to loaded state on image load", () => {
    const onLoad = vi.fn();
    const { getByRole } = render(<Image src="test.jpg" alt="test image" onLoad={onLoad} />);
    
    const img = getByRole("img");
    fireEvent.load(img);
    
    expect(img).toHaveClass("opacity-100");
    expect(onLoad).toHaveBeenCalled();
  });

  it("attempts fallback on error if provided", () => {
    const { getByRole } = render(
      <Image src="broken.jpg" alt="test image" fallbackSrc="fallback.jpg" />
    );
    
    const img = getByRole("img");
    fireEvent.error(img);
    
    // Should now point to fallback
    expect(img).toHaveAttribute("src", "fallback.jpg");
  });

  it("shows error state if fallback fails or no fallback provided", () => {
    const onError = vi.fn();
    const { getByText, getByRole } = render(
      <Image src="broken.jpg" alt="test image" onError={onError} />
    );
    
    const img = getByRole("img");
    fireEvent.error(img);
    
    expect(getByText("Failed to load")).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });

  it("shows custom error children on error", () => {
    const { getByText, getByRole } = render(
      <Image src="broken.jpg" alt="test image">
        <div>Custom Error</div>
      </Image>
    );
    
    const img = getByRole("img");
    fireEvent.error(img);
    
    expect(getByText("Custom Error")).toBeInTheDocument();
  });

  it("resets state when src changes", () => {
    const { getByRole, rerender, container } = render(
      <Image src="test1.jpg" alt="test image" />
    );
    
    const img = getByRole("img");
    fireEvent.load(img);
    expect(img).toHaveClass("opacity-100");
    
    // Change src
    rerender(<Image src="test2.jpg" alt="test image" />);
    
    const newImg = getByRole("img");
    expect(newImg).toHaveAttribute("src", "test2.jpg");
    // Should be back to loading state
    expect(newImg).toHaveClass("opacity-0");
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
