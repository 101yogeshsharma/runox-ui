import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileUploader } from "./FileUploader";

describe("FileUploader behavior", () => {
  it("adds and removes accepted files", () => {
    const onFilesChange = vi.fn();
    const file = new File(["content"], "example.txt", { type: "text/plain" });
    const { container } = render(
      <FileUploader onFilesChange={onFilesChange} />,
    );
    const input = container.querySelector("input[type=file]")!;

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText("example.txt")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove example.txt" }),
    ).toBeInTheDocument();
    expect(onFilesChange).toHaveBeenLastCalledWith([file]);

    fireEvent.click(screen.getByRole("button", { name: "Remove example.txt" }));
    expect(onFilesChange).toHaveBeenLastCalledWith([]);
  });

  it("reports rejected files and respects maxFiles", () => {
    const onFilesChange = vi.fn();
    const onFileRejected = vi.fn();
    const first = new File(["a"], "first.txt", { type: "text/plain" });
    const second = new File(["b"], "second.txt", { type: "text/plain" });
    const rejected = new File(["c"], "third.png", { type: "image/png" });
    const { container } = render(
      <FileUploader
        accept=".txt"
        maxFiles={1}
        onFilesChange={onFilesChange}
        onFileRejected={onFileRejected}
      />,
    );
    const input = container.querySelector("input[type=file]")!;

    fireEvent.change(input, { target: { files: [first, second, rejected] } });

    expect(onFileRejected).toHaveBeenCalledWith(
      rejected,
      "File type image/png not supported",
    );
    expect(onFilesChange).toHaveBeenLastCalledWith([first]);
    expect(screen.getByText("first.txt")).toBeInTheDocument();
    expect(screen.queryByText("second.txt")).not.toBeInTheDocument();
  });
});
