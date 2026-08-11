"use client";

import React, { useState } from "react";
import { cn } from "../../utils/cn";
import { Text } from "../../atoms/Text";
import { Flex } from "../../atoms/Flex";
import { Box } from "../../atoms/Box";
import { Button } from "../Button";
// Uses: Button
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./KanbanBoard.css";

export type UniqueIdentifier = string | number;

export interface KanbanItemData {
  id: UniqueIdentifier;
  [key: string]: unknown;
}

export interface KanbanColumnData<T> {
  id: UniqueIdentifier;
  title: string;
  items: T[];
}

export interface KanbanBoardProps<T> {
  columns: KanbanColumnData<T>[];
  onColumnsChange: (columns: KanbanColumnData<T>[]) => void;
  renderItem: (item: T) => React.ReactNode;
  keyExtractor?: (item: T) => UniqueIdentifier;
  className?: string;
}

/**
 * @deprecated Use `Kanban` instead.
 */
export function KanbanBoard<T extends { id?: UniqueIdentifier }>({
  columns,
  onColumnsChange,
  renderItem,
  keyExtractor,
  className,
}: KanbanBoardProps<T>) {
  const getItemId = React.useCallback(
    (item: T) => {
      if (keyExtractor) return keyExtractor(item);
      if ("id" in item && item.id !== undefined) return item.id;
      throw new Error(
        "KanbanBoard items must have an id property or a keyExtractor must be provided."
      );
    },
    [keyExtractor]
  );
  const [draggedItemId, setDraggedItemId] = useState<UniqueIdentifier | null>(
    null
  );
  const [dragOverItemId, setDragOverItemId] = useState<UniqueIdentifier | null>(
    null
  );
  const [dragOverColumnId, setDragOverColumnId] =
    useState<UniqueIdentifier | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );

  const handleDragStart = (
    e: React.DragEvent<HTMLElement>,
    itemId: UniqueIdentifier
  ) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemId.toString());
  };

  const handleDragOverItem = (
    e: React.DragEvent<HTMLElement>,
    itemId: UniqueIdentifier,
    colId: UniqueIdentifier
  ) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    if (draggedItemId === itemId) return;

    setDragOverItemId(itemId);
    setDragOverColumnId(colId);

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDropPosition(e.clientY < midY ? "before" : "after");
  };

  const handleDragLeaveItem = (
    e: React.DragEvent<HTMLElement>,
    itemId: UniqueIdentifier
  ) => {
    if (dragOverItemId === itemId) {
      setDragOverItemId(null);
      setDropPosition(null);
    }
  };

  const handleDragOverColumn = (
    e: React.DragEvent<HTMLElement>,
    colId: UniqueIdentifier
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (!dragOverItemId) {
      setDragOverColumnId(colId);
    }
  };

  const handleDragLeaveColumn = (
    e: React.DragEvent<HTMLElement>,
    colId: UniqueIdentifier
  ) => {
    if (dragOverColumnId === colId && !dragOverItemId) {
      setDragOverColumnId(null);
    }
  };

  const handleDropItem = (
    e: React.DragEvent<HTMLElement>,
    targetItemId: UniqueIdentifier
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItemId || draggedItemId === targetItemId) {
      resetDragState();
      return;
    }

    moveItem(draggedItemId, targetItemId, null, dropPosition);
    resetDragState();
  };

  const handleDropColumn = (
    e: React.DragEvent<HTMLElement>,
    targetColId: UniqueIdentifier
  ) => {
    e.preventDefault();

    if (!draggedItemId) {
      resetDragState();
      return;
    }

    moveItem(draggedItemId, null, targetColId, "after");
    resetDragState();
  };

  const moveItem = (
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier | null,
    overColId: UniqueIdentifier | null,
    position: "before" | "after" | null
  ) => {
    let activeColIndex = -1;
    let activeItemIndex = -1;

    for (let i = 0; i < columns.length; i++) {
      const idx = columns[i].items.findIndex(
        (item) => getItemId(item) === activeId
      );
      if (idx !== -1) {
        activeColIndex = i;
        activeItemIndex = idx;
        break;
      }
    }

    if (activeColIndex === -1) return;

    const newColumns = columns.map((c) => ({ ...c, items: [...c.items] }));
    const [movedItem] = newColumns[activeColIndex].items.splice(
      activeItemIndex,
      1
    );

    if (overId !== null) {
      let overColIndex = -1;
      let overItemIndex = -1;
      for (let i = 0; i < newColumns.length; i++) {
        const idx = newColumns[i].items.findIndex(
          (item) => getItemId(item) === overId
        );
        if (idx !== -1) {
          overColIndex = i;
          overItemIndex = idx;
          break;
        }
      }

      if (overColIndex !== -1) {
        let newIndex = overItemIndex;
        if (position === "after") {
          newIndex = overItemIndex + 1;
        }
        newIndex = Math.max(
          0,
          Math.min(newIndex, newColumns[overColIndex].items.length)
        );
        newColumns[overColIndex].items.splice(newIndex, 0, movedItem);
      } else {
        newColumns[activeColIndex].items.splice(activeItemIndex, 0, movedItem);
      }
    } else if (overColId !== null) {
      const overColIndex = newColumns.findIndex((c) => c.id === overColId);
      if (overColIndex !== -1) {
        newColumns[overColIndex].items.push(movedItem);
      } else {
        newColumns[activeColIndex].items.splice(activeItemIndex, 0, movedItem);
      }
    }

    onColumnsChange(newColumns);
  };

  const handleDragEnd = () => {
    resetDragState();
  };

  const resetDragState = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
    setDragOverColumnId(null);
    setDropPosition(null);
  };

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      // Use a small threshold (e.g. 1px) to prevent floating point issues on some screens
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  React.useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [columns]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400; // Adjust scroll distance
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <Box className="group relative h-full w-full">
      {/* Scroll Left Button */}
      <Button
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        variant="ghost"
        className={cn(
          "rnx-kanban-scroll-button absolute top-1/2 left-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center",
          !canScrollLeft
            ? "rnx-kanban-scroll-button--hidden"
            : "rnx-kanban-scroll-button--visible"
        )}
        aria-label="Scroll left"
      >
        <ChevronLeft className="rnx-kanban-scroll-icon" />
      </Button>

      {/* Scroll Right Button */}
      <Button
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        variant="ghost"
        className={cn(
          "rnx-kanban-scroll-button absolute top-1/2 right-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center",
          !canScrollRight
            ? "rnx-kanban-scroll-button--hidden"
            : "rnx-kanban-scroll-button--visible"
        )}
        aria-label="Scroll right"
      >
        <ChevronRight className="rnx-kanban-scroll-icon" />
      </Button>

      <Flex
        ref={scrollContainerRef}
        onScroll={checkScroll}
        gap="lg"
        justify="start"
        className={cn(
          "scrollbar-hide h-full min-h-96 w-full overflow-x-auto py-4 py-12",
          className
        )}
      >
        <Box className="w-8 shrink-0" />

        {columns.map((col) => {
          const isColumnDragOver =
            dragOverColumnId === col.id && !dragOverItemId;

          return (
            <MemoizedColumn
              key={col.id}
              col={col}
              isColumnDragOver={isColumnDragOver}
              draggedItemId={draggedItemId}
              dragOverItemId={dragOverItemId}
              dropPosition={dropPosition}
              getItemId={getItemId}
              renderItem={renderItem}
              handleDragOverColumn={handleDragOverColumn}
              handleDragLeaveColumn={handleDragLeaveColumn}
              handleDropColumn={handleDropColumn}
              handleDragStart={handleDragStart}
              handleDragOverItem={handleDragOverItem}
              handleDragLeaveItem={handleDragLeaveItem}
              handleDropItem={handleDropItem}
              handleDragEnd={handleDragEnd}
            />
          );
        })}

        <Box className="w-8 shrink-0" />
      </Flex>
    </Box>
  );
}

export const MemoizedCard = React.memo(({ item, itemId, isDragging, isDragOver, colId, dropPosition, renderItem, handleDragStart, handleDragOverItem, handleDragLeaveItem, handleDropItem, handleDragEnd }: any) => {
  let indicatorStyles = "";
  if (isDragOver && !isDragging) {
    indicatorStyles =
      dropPosition === "before"
        ? "rnx-kanban-card--drag-over-before"
        : "rnx-kanban-card--drag-over-after";
  }

  return (
    <Box
      draggable
      onDragStart={(e) => handleDragStart(e, itemId)}
      onDragOver={(e) => handleDragOverItem(e, itemId, colId)}
      onDragLeave={(e) => handleDragLeaveItem(e, itemId)}
      onDrop={(e) => handleDropItem(e, itemId)}
      onDragEnd={handleDragEnd}
      className={cn(
        "rnx-kanban-card touch-none",
        isDragging
          ? "rnx-kanban-card--dragging"
          : "rnx-kanban-card--draggable",
        indicatorStyles
      )}
    >
      {renderItem(item)}
    </Box>
  );
});
MemoizedCard.displayName = "MemoizedCard";

export const MemoizedColumn = React.memo(({ col, isColumnDragOver, draggedItemId, dragOverItemId, dropPosition, getItemId, renderItem, handleDragOverColumn, handleDragLeaveColumn, handleDropColumn, handleDragStart, handleDragOverItem, handleDragLeaveItem, handleDropItem, handleDragEnd }: any) => {
  return (
    <Flex
      direction="col"
      onDragOver={(e) => handleDragOverColumn(e, col.id)}
      onDragLeave={(e) => handleDragLeaveColumn(e, col.id)}
      onDrop={(e) => handleDropColumn(e, col.id)}
      className={cn(
        "rnx-kanban-column w-80 shrink-0 p-4",
        isColumnDragOver && "rnx-kanban-column--drag-over"
      )}
    >
      <Flex align="center" justify="between" className="mb-4 px-2">
        <Text as="h3" className="rnx-kanban-column-title">
          {col.title}
        </Text>
        <Box
          as="span"
          className="rnx-kanban-column-count px-2.5 py-0.5"
        >
          {col.items.length}
        </Box>
      </Flex>

      <Flex direction="col" gap="sm" className="min-h-40 flex-1">
        {col.items.map((item: any) => {
          const itemId = getItemId(item);
          const isDragging = draggedItemId === itemId;
          const isDragOver = dragOverItemId === itemId;

          return (
            <MemoizedCard
              key={itemId}
              item={item}
              itemId={itemId}
              isDragging={isDragging}
              isDragOver={isDragOver}
              colId={col.id}
              dropPosition={dropPosition}
              renderItem={renderItem}
              handleDragStart={handleDragStart}
              handleDragOverItem={handleDragOverItem}
              handleDragLeaveItem={handleDragLeaveItem}
              handleDropItem={handleDropItem}
              handleDragEnd={handleDragEnd}
            />
          );
        })}
      </Flex>
    </Flex>
  );
});
MemoizedColumn.displayName = "MemoizedColumn";
