"use client";

import React, { useState } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "../../utils/cn";
import { Flex } from "../../atoms/Flex";
import { Box } from "../../atoms/Box";
import { rnx } from "../../utils/rnx";
import "./SortableList.css";

export interface SortableListProps<T> {
  items: T[];
  onSortEnd: (items: T[]) => void;
  renderItem: (item: T, isDragging: boolean) => React.ReactNode;
  keyExtractor: (item: T) => string;
  direction?: "vertical" | "horizontal";
  className?: string;
}

const SortableItemContext = React.createContext<{
  id: string;
} | null>(null);

interface SortableItemProps<T> {
  id: string;
  item: T;
  isDragging: boolean;
  isDragOver: boolean;
  isVertical: boolean;
  dropPosition: "before" | "after" | null;
  renderItem: (item: T, isDragging: boolean) => React.ReactNode;
  onDragStart: (e: React.DragEvent<HTMLElement>, id: string) => void;
  onDragOver: (e: React.DragEvent<HTMLElement>, id: string) => void;
  onDragLeave: (e: React.DragEvent<HTMLElement>, id: string) => void;
  onDrop: (e: React.DragEvent<HTMLElement>, id: string) => void;
  onDragEnd: () => void;
  onMoveItem: (id: string, direction: "prev" | "next") => void;
}

function SortableItemInner<T>({
  id,
  item,
  isDragging,
  isDragOver,
  isVertical,
  dropPosition,
  renderItem,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onMoveItem,
}: SortableItemProps<T>) {
  let indicatorStyles = "";
  if (isDragOver && !isDragging) {
    if (isVertical) {
      indicatorStyles =
        dropPosition === "before"
          ? "rnx-sortable-item--indicator-top"
          : "rnx-sortable-item--indicator-bottom";
    } else {
      indicatorStyles =
        dropPosition === "before"
          ? "rnx-sortable-item--indicator-left"
          : "rnx-sortable-item--indicator-right";
    }
  }

  const contextValue = React.useMemo(() => ({ id }), [id]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowUp" || (!isVertical && e.key === "ArrowLeft")) {
      e.preventDefault();
      onMoveItem(id, "prev");
    } else if (e.key === "ArrowDown" || (!isVertical && e.key === "ArrowRight")) {
      e.preventDefault();
      onMoveItem(id, "next");
    }
  };

  return (
    <SortableItemContext.Provider value={contextValue}>
      <Box
        role="listitem"
        tabIndex={0}
        draggable
        onKeyDown={handleKeyDown}
        onDragStart={(e: React.DragEvent<HTMLElement>) => onDragStart(e, id)}
        onDragOver={(e: React.DragEvent<HTMLElement>) => onDragOver(e, id)}
        onDragLeave={(e: React.DragEvent<HTMLElement>) => onDragLeave(e, id)}
        onDrop={(e: React.DragEvent<HTMLElement>) => onDrop(e, id)}
        onDragEnd={onDragEnd}
        className={cn(
          "rnx-sortable-item relative touch-none",
          isDragging ? "rnx-sortable-item--dragging" : "z-0",
          indicatorStyles
        )}
      >
        {renderItem(item, isDragging)}
      </Box>
    </SortableItemContext.Provider>
  );
}

// Memo wrapper: cast to unknown avoids the generic-erasure TypeScript issue
const SortableItem = React.memo(SortableItemInner) as typeof SortableItemInner;

function SortableList<T>({
  items,
  onSortEnd,
  renderItem,
  keyExtractor,
  direction = "vertical",
  className,
}: SortableListProps<T>) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );

  const isVertical = direction === "vertical";

  const handleDragStart = React.useCallback((e: React.DragEvent<HTMLElement>, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }, []);

  const handleDragOver = React.useCallback((e: React.DragEvent<HTMLElement>, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedId === id) return;

    setDragOverId(id);

    const rect = e.currentTarget.getBoundingClientRect();
    if (isVertical) {
      const midY = rect.top + rect.height / 2;
      setDropPosition(e.clientY < midY ? "before" : "after");
    } else {
      const midX = rect.left + rect.width / 2;
      setDropPosition(e.clientX < midX ? "before" : "after");
    }
  }, [draggedId, isVertical]);

  const handleDragLeave = React.useCallback((e: React.DragEvent<HTMLElement>, id: string) => {
    if (dragOverId === id) {
      setDragOverId(null);
      setDropPosition(null);
    }
  }, [dragOverId]);

  const handleDrop = React.useCallback((e: React.DragEvent<HTMLElement>, id: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === id) {
      setDragOverId(null);
      setDropPosition(null);
      return;
    }

    const oldIndex = items.findIndex(
      (item) => keyExtractor(item) === draggedId
    );

    if (oldIndex !== -1) {
      const newItems = [...items];
      const [movedItem] = newItems.splice(oldIndex, 1);

      const targetIndex = newItems.findIndex(
        (item) => keyExtractor(item) === id
      );

      if (targetIndex !== -1) {
        let newIndex = targetIndex;
        if (dropPosition === "after") {
          newIndex = targetIndex + 1;
        }
        newItems.splice(newIndex, 0, movedItem);
        onSortEnd(newItems);
      } else {
        newItems.splice(oldIndex, 0, movedItem);
      }
    }

    setDraggedId(null);
    setDragOverId(null);
    setDropPosition(null);
  }, [draggedId, dropPosition, items, keyExtractor, onSortEnd]);

  const handleDragEnd = React.useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
    setDropPosition(null);
  }, []);

  const handleMoveItem = React.useCallback(
    (id: string, moveDirection: "prev" | "next") => {
      const currentIndex = items.findIndex((item) => keyExtractor(item) === id);
      if (currentIndex === -1) return;

      const targetIndex =
        moveDirection === "prev" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return;

      const newItems = [...items];
      const [movedItem] = newItems.splice(currentIndex, 1);
      newItems.splice(targetIndex, 0, movedItem);
      onSortEnd(newItems);
    },
    [items, keyExtractor, onSortEnd]
  );

  return (
    <Flex
      {...rnx({ component: 'SortableList' })}
      role="list"
      aria-label="Sortable list"
      gap="sm"
      direction={isVertical ? "col" : "row"}
      className={cn("rnx-sortable-list", className)}
    >
      {items.map((item) => {
        const id = keyExtractor(item);
        const isDragging = draggedId === id;
        const isDragOver = dragOverId === id;

        return (
          <SortableItem
            key={id}
            id={id}
            item={item}
            isDragging={isDragging}
            isDragOver={isDragOver}
            isVertical={isVertical}
            dropPosition={dropPosition}
            renderItem={renderItem}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onMoveItem={handleMoveItem}
          />
        );
      })}
    </Flex>
  );
}

function SortableDragHandle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(SortableItemContext);
  if (!context) {
    throw new Error(
      "SortableDragHandle must be used within a SortableList item render function"
    );
  }

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label="Drag handle"
      aria-roledescription="sortable"
      className={cn("rnx-sortable-drag-handle cursor-grab active:cursor-grabbing", className)}
      {...props}
    >
      <GripVertical className="h-4 w-4" />
    </Box>
  );
}

export type SortableListWithDragHandle = typeof SortableList & {
  DragHandle: typeof SortableDragHandle;
};

(SortableList as SortableListWithDragHandle).DragHandle = SortableDragHandle;

export { SortableList };
