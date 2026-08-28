import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileUploader } from "./FileUploader";

describe("FileUploader", () => {
  it("blocks file selection and drops when disabled", () => {
    const onFilesChange = vi.fn();
    const file = new File(["content"], "example.txt", { type: "text/plain" });
    const { container } = render(
      <FileUploader disabled onFilesChange={onFilesChange} />,
    );
    const input = container.querySelector("input[type=file]");
    const dropzone = container.querySelector(".rnx-file-uploader-dropzone");

    expect(input).toBeDisabled();
    expect(dropzone).toHaveAttribute("aria-disabled", "true");
    expect(dropzone).toHaveAttribute("tabindex", "-1");

    fireEvent.change(input!, { target: { files: [file] } });
    fireEvent.drop(dropzone!, { dataTransfer: { files: [file] } });

    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it("forwards ref to the root element", () => {
    let elementRef: HTMLDivElement | null = null;
    render(
      <FileUploader
        ref={(node) => {
          elementRef = node;
        }}
      />,
    );
    expect(elementRef).toBeInstanceOf(HTMLDivElement);
  });
});
