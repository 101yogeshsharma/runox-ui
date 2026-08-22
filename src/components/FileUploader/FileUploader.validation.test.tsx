import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileUploader } from "./FileUploader";

describe("FileUploader validation", () => {
  it("supports wildcard accepts, size limits, single mode, and drops", () => {
    const onFilesChange = vi.fn();
    const onFileRejected = vi.fn();
    const image = new File(["img"], "photo.png", { type: "image/png" });
    const oversized = new File(["x".repeat(20)], "big.png", {
      type: "image/png",
    });
    const { container } = render(
      <FileUploader
        accept="image/*"
        maxSize={10}
        multiple={false}
        onFilesChange={onFilesChange}
        onFileRejected={onFileRejected}
      />,
    );
    const dropzone = container.querySelector(".rnx-file-uploader-dropzone")!;

    fireEvent.drop(dropzone, {
      dataTransfer: { files: [image, oversized] },
    });

    expect(onFileRejected).toHaveBeenCalledWith(
      oversized,
      "File size exceeds the limit of 10 Bytes",
    );
    expect(screen.getByText("photo.png")).toBeInTheDocument();

    const replacement = new File(["next"], "next.jpg", { type: "image/jpeg" });
    fireEvent.drop(dropzone, { dataTransfer: { files: [replacement] } });
    expect(onFilesChange).toHaveBeenLastCalledWith([replacement]);
    expect(screen.queryByText("photo.png")).not.toBeInTheDocument();
  });
});
