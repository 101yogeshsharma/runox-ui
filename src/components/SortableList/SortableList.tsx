"use client";

import React, { useState } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "../../utils/cn";
import { Flex } from "../../atoms/Flex";
import { Box } from "../../atoms/Box";
import { useTheme } from "../ThemeProvider/ThemeProvider";
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

export function SortableList<T>({
  items,
  onSortEnd,
  renderItem,
  keyExtractor,
  direction = "vertical",
  className,
}: SortableListProps<T>) {
  const { config } = useTheme();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );

  const isVertical = direction === "vertical";

  const handleDragStart = (e: React.DragEvent<HTMLElement>, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>, id: string) => {
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
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>, id: string) => {
    if (dragOverId === id) {
      setDragOverId(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>, id: string) => {
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
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    setDropPosition(null);
  };

  return (
    <Flex
      gap="sm"
      direction={isVertical ? "col" : "row"}
      className={cn("rnx-sortable-list", `rounded-${config.radius}`, className)}
    >
      {items.map((item) => {
        const id = keyExtractor(item);
        const isDragging = draggedId === id;
        const isDragOver = dragOverId === id;

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

        return (
          <SortableItemContext.Provider key={id} value={{ id }}>
            <Box
              draggable
              onDragStart={(e: React.DragEvent<HTMLElement>) =>
                handleDragStart(e, id)
              }
              onDragOver={(e: React.DragEvent<HTMLElement>) =>
                handleDragOver(e, id)
              }
              onDragLeave={(e: React.DragEvent<HTMLElement>) =>
                handleDragLeave(e, id)
              }
              onDrop={(e: React.DragEvent<HTMLElement>) => handleDrop(e, id)}
              onDragEnd={handleDragEnd}
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
      })}
    </Flex>
  );
}

export function SortableDragHandle({
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
    <Box className={cn("rnx-sortable-drag-handle", className)} {...props}>
      <GripVertical className="h-4 w-4" />
    </Box>
  );
}
