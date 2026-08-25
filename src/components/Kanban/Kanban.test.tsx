import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Kanban } from "./Kanban";

function renderBoard(onCardMove: ReturnType<typeof vi.fn>) {
  return render(
    <Kanban onCardMove={onCardMove}>
      <Kanban.Column id="col-1">
        <Kanban.Card id="card-1">First</Kanban.Card>
        <Kanban.Card id="card-2">Second</Kanban.Card>
      </Kanban.Column>
      <Kanban.Column id="col-2" />
    </Kanban>,
  );
}

describe("Kanban", () => {
  it("renders the scroll container with a single vertical padding utility", () => {
    const { container } = renderBoard(vi.fn());

    const scrollContainer = container.querySelector(".rnx-scrollbar-hide")!;
    const classes = scrollContainer.className.split(/\s+/);

    expect(classes).toContain("py-12");
    expect(classes.filter((name) => /^py-\d+$/.test(name))).toHaveLength(1);
  });

  it("throws when components are used outside their providers", () => {
    expect(() => render(<Kanban.Card id="orphan">X</Kanban.Card>)).toThrow(
      "Kanban components must be used within a Kanban",
    );
  });

  it("moves a card between columns via drag and drop", () => {
    const onCardMove = vi.fn();
    renderBoard(onCardMove);

    const card = screen.getByText("First");
    const targetColumn = screen.getByLabelText("Column col-2");

    fireEvent.dragStart(card, {
      dataTransfer: { effectAllowed: "", setData: vi.fn() },
    });
    fireEvent.dragOver(targetColumn, { dataTransfer: {} });
    fireEvent.drop(targetColumn, { dataTransfer: {} });

    expect(onCardMove).toHaveBeenCalledWith("card-1", null, "col-2", "after");
  });

  it("highlights a column while a card is dragged over it and resets on end", () => {
    renderBoard(vi.fn());

    const card = screen.getByText("Second");
    const column = screen.getByLabelText("Column col-1");

    fireEvent.dragStart(card, {
      dataTransfer: { effectAllowed: "", setData: vi.fn() },
    });
    fireEvent.dragOver(column, { dataTransfer: {} });
    expect(column).toHaveClass("rnx-kanban-column--drag-over");

    fireEvent.dragEnd(card);
    expect(column).not.toHaveClass("rnx-kanban-column--drag-over");
  });

  it("tracks drop position when dragging over another card", () => {
    const onCardMove = vi.fn();
    renderBoard(onCardMove);

    const dragged = screen.getByText("First");
    const target = screen.getByText("Second");

    fireEvent.dragStart(dragged, {
      dataTransfer: { effectAllowed: "", setData: vi.fn() },
    });
    fireEvent.dragOver(target, {
      dataTransfer: { dropEffect: "" },
      clientY: 0,
    });
    fireEvent.drop(target, { dataTransfer: {} });

    // jsdom rects are all zero, so midY is 0 and clientY 0 is not above it
    expect(onCardMove).toHaveBeenCalledWith("card-1", "card-2", null, "after");
  });

  it("drops a card onto an empty column and clears drag state on leave", () => {
    const onCardMove = vi.fn();
    renderBoard(onCardMove);

    const card = screen.getByText("First");
    const emptyColumn = screen.getByLabelText("Column col-2");

    fireEvent.dragStart(card, {
      dataTransfer: { effectAllowed: "", setData: vi.fn() },
    });
    fireEvent.dragOver(emptyColumn, { dataTransfer: {} });
    fireEvent.drop(emptyColumn, { dataTransfer: {} });

    expect(onCardMove).toHaveBeenCalledWith("card-1", null, "col-2", "after");

    fireEvent.dragLeave(emptyColumn);
    expect(emptyColumn).not.toHaveClass("rnx-kanban-column--drag-over");
  });
});
