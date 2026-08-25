"use client";

import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { cn } from "../../utils/cn";
import { rnx } from "../../utils/rnx";
import { Flex } from "../../atoms/Flex";
import { Box } from "../../atoms/Box";
import { Text } from "../../atoms/Text";
import { Button } from "../Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Kanban.css";

export type UniqueIdentifier = string | number;

interface KanbanContextValue {
  draggedItemId: UniqueIdentifier | null;
  dragOverItemId: UniqueIdentifier | null;
  dragOverColumnId: UniqueIdentifier | null;
  dropPosition: "before" | "after" | null;
  handleDragStart: (
    e: React.DragEvent<HTMLElement>,
    itemId: UniqueIdentifier,
  ) => void;
  handleDragOverItem: (
    e: React.DragEvent<HTMLElement>,
    itemId: UniqueIdentifier,
    colId: UniqueIdentifier,
  ) => void;
  handleDragLeaveItem: (
    e: React.DragEvent<HTMLElement>,
    itemId: UniqueIdentifier,
  ) => void;
  handleDragOverColumn: (
    e: React.DragEvent<HTMLElement>,
    colId: UniqueIdentifier,
  ) => void;
  handleDragLeaveColumn: (
    e: React.DragEvent<HTMLElement>,
    colId: UniqueIdentifier,
  ) => void;
  handleDropItem: (
    e: React.DragEvent<HTMLElement>,
    targetItemId: UniqueIdentifier,
  ) => void;
  handleDropColumn: (
    e: React.DragEvent<HTMLElement>,
    targetColId: UniqueIdentifier,
  ) => void;
  handleDragEnd: () => void;
}

const KanbanContext = createContext<KanbanContextValue | null>(null);

function useKanban() {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error("Kanban components must be used within a Kanban");
  }
  return context;
}

const KanbanColumnContext = createContext<UniqueIdentifier | null>(null);

function useKanbanColumn() {
  const context = useContext(KanbanColumnContext);
  if (!context) {
    throw new Error("Kanban components must be used within a KanbanColumn");
  }
  return context;
}

/**
 * Props for the Kanban component.
 */
export interface KanbanProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onDrop"
> {
  onCardMove: (
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier | null,
    overColId: UniqueIdentifier | null,
    position: "before" | "after" | null,
  ) => void;
}

const KanbanRoot = React.forwardRef<HTMLDivElement, KanbanProps>(
  ({ children, className, onCardMove, ...props }, ref) => {
    const [draggedItemId, setDraggedItemId] = useState<UniqueIdentifier | null>(
      null,
    );
    const [dragOverItemId, setDragOverItemId] =
      useState<UniqueIdentifier | null>(null);
    const [dragOverColumnId, setDragOverColumnId] =
      useState<UniqueIdentifier | null>(null);
    const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
      null,
    );

    // Ref mirror of drag state so handlers can be stable (useCallback with [])
    // without going stale during rapid dragover events.
    const dragStateRef = useRef({
      draggedItemId: null as UniqueIdentifier | null,
      dragOverItemId: null as UniqueIdentifier | null,
      dragOverColumnId: null as UniqueIdentifier | null,
      dropPosition: null as "before" | "after" | null,
      onCardMove,
    });
    dragStateRef.current.onCardMove = onCardMove;

    const resetDragState = useCallback(() => {
      dragStateRef.current.draggedItemId = null;
      dragStateRef.current.dragOverItemId = null;
      dragStateRef.current.dragOverColumnId = null;
      dragStateRef.current.dropPosition = null;
      setDraggedItemId(null);
      setDragOverItemId(null);
      setDragOverColumnId(null);
      setDropPosition(null);
    }, []);

    const handleDragStart = useCallback(
      (e: React.DragEvent<HTMLElement>, itemId: UniqueIdentifier) => {
        dragStateRef.current.draggedItemId = itemId;
        setDraggedItemId(itemId);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", itemId.toString());
      },
      [],
    );

    const handleDragOverItem = useCallback(
      (
        e: React.DragEvent<HTMLElement>,
        itemId: UniqueIdentifier,
        colId: UniqueIdentifier,
      ) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";

        const state = dragStateRef.current;
        if (state.draggedItemId === itemId) return;

        if (
          state.dragOverItemId !== itemId ||
          state.dragOverColumnId !== colId
        ) {
          state.dragOverItemId = itemId;
          state.dragOverColumnId = colId;
          setDragOverItemId(itemId);
          setDragOverColumnId(colId);
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const nextPos: "before" | "after" =
          e.clientY < midY ? "before" : "after";
        if (state.dropPosition !== nextPos) {
          state.dropPosition = nextPos;
          setDropPosition(nextPos);
        }
      },
      [],
    );

    const handleDragLeaveItem = useCallback(
      (e: React.DragEvent<HTMLElement>, itemId: UniqueIdentifier) => {
        const state = dragStateRef.current;
        if (state.dragOverItemId === itemId) {
          state.dragOverItemId = null;
          state.dropPosition = null;
          setDragOverItemId(null);
          setDropPosition(null);
        }
      },
      [],
    );

    const handleDragOverColumn = useCallback(
      (e: React.DragEvent<HTMLElement>, colId: UniqueIdentifier) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        const state = dragStateRef.current;
        if (!state.dragOverItemId && state.dragOverColumnId !== colId) {
          state.dragOverColumnId = colId;
          setDragOverColumnId(colId);
        }
      },
      [],
    );

    const handleDragLeaveColumn = useCallback(
      (e: React.DragEvent<HTMLElement>, colId: UniqueIdentifier) => {
        const state = dragStateRef.current;
        if (state.dragOverColumnId === colId && !state.dragOverItemId) {
          state.dragOverColumnId = null;
          setDragOverColumnId(null);
        }
      },
      [],
    );

    const handleDropItem = useCallback(
      (e: React.DragEvent<HTMLElement>, targetItemId: UniqueIdentifier) => {
        e.preventDefault();
        e.stopPropagation();

        const {
          draggedItemId,
          dropPosition,
          onCardMove: move,
        } = dragStateRef.current;
        if (!draggedItemId || draggedItemId === targetItemId) {
          resetDragState();
          return;
        }

        move(draggedItemId, targetItemId, null, dropPosition);
        resetDragState();
      },
      [resetDragState],
    );

    const handleDropColumn = useCallback(
      (e: React.DragEvent<HTMLElement>, targetColId: UniqueIdentifier) => {
        e.preventDefault();

        const { draggedItemId, onCardMove: move } = dragStateRef.current;
        if (!draggedItemId) {
          resetDragState();
          return;
        }

        move(draggedItemId, null, targetColId, "after");
        resetDragState();
      },
      [resetDragState],
    );

    const handleDragEnd = useCallback(() => {
      resetDragState();
    }, [resetDragState]);

    const contextValue: KanbanContextValue = useMemo(
      () => ({
        draggedItemId,
        dragOverItemId,
        dragOverColumnId,
        dropPosition,
        handleDragStart,
        handleDragOverItem,
        handleDragLeaveItem,
        handleDragOverColumn,
        handleDragLeaveColumn,
        handleDropItem,
        handleDropColumn,
        handleDragEnd,
      }),
      [
        draggedItemId,
        dragOverItemId,
        dragOverColumnId,
        dropPosition,
        handleDragStart,
        handleDragOverItem,
        handleDragLeaveItem,
        handleDragOverColumn,
        handleDragLeaveColumn,
        handleDropItem,
        handleDropColumn,
        handleDragEnd,
      ],
    );

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // rAF-throttled so rapid scroll events coalesce into one state update/frame.
    const rafRef = useRef<number | null>(null);
    const checkScroll = useCallback(() => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const el = scrollContainerRef.current;
        if (el) {
          const { scrollLeft, scrollWidth, clientWidth } = el;
          const nextLeft = scrollLeft > 0;
          const nextRight = Math.ceil(scrollLeft + clientWidth) < scrollWidth;
          // Only commit when values actually changed — avoids re-render churn.
          setCanScrollLeft((prev) => (prev === nextLeft ? prev : nextLeft));
          setCanScrollRight((prev) => (prev === nextRight ? prev : nextRight));
        }
      });
    }, []);

    React.useEffect(() => {
      checkScroll();
      window.addEventListener("resize", checkScroll);
      return () => {
        window.removeEventListener("resize", checkScroll);
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }, [checkScroll]);

    const scroll = (direction: "left" | "right") => {
      if (scrollContainerRef.current) {
        const scrollAmount = 400;
        scrollContainerRef.current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    };

    return (
      <KanbanContext.Provider value={contextValue}>
        <Box
          ref={ref}
          {...rnx({ component: "Kanban" })}
          className={cn("rnx-kanban group relative h-full w-full", className)}
          {...props}
        >
          <Button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            variant="ghost"
            className={cn(
              "rnx-kanban-scroll-button absolute top-1/2 left-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center",
              !canScrollLeft
                ? "rnx-kanban-scroll-button--hidden"
                : "rnx-kanban-scroll-button--visible",
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="rnx-kanban-scroll-icon" />
          </Button>

          <Button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            variant="ghost"
            className={cn(
              "rnx-kanban-scroll-button absolute top-1/2 right-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center",
              !canScrollRight
                ? "rnx-kanban-scroll-button--hidden"
                : "rnx-kanban-scroll-button--visible",
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
            className="rnx-scrollbar-hide h-full min-h-96 w-full overflow-x-auto py-12"
          >
            <Box className="w-8 shrink-0" />
            {children}
            <Box className="w-8 shrink-0" />
          </Flex>
        </Box>
      </KanbanContext.Provider>
    );
  },
);
KanbanRoot.displayName = "Kanban";

export interface KanbanColumnProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "id"
> {
  id: UniqueIdentifier;
}

const KanbanColumn = React.forwardRef<HTMLDivElement, KanbanColumnProps>(
  ({ id, children, className, ...props }, ref) => {
    const {
      dragOverColumnId,
      dragOverItemId,
      handleDragOverColumn,
      handleDragLeaveColumn,
      handleDropColumn,
    } = useKanban();

    const isColumnDragOver = dragOverColumnId === id && !dragOverItemId;

    return (
      <KanbanColumnContext.Provider value={id}>
        <Flex
          ref={ref}
          role="list"
          aria-label={
            typeof props["aria-label"] === "string"
              ? props["aria-label"]
              : `Column ${String(id)}`
          }
          direction="col"
          gap="sm"
          onDragOver={(e) => handleDragOverColumn(e, id)}
          onDragLeave={(e) => handleDragLeaveColumn(e, id)}
          onDrop={(e) => handleDropColumn(e, id)}
          className={cn(
            "rnx-kanban-column w-80 shrink-0 p-4",
            isColumnDragOver && "rnx-kanban-column--drag-over",
            className,
          )}
          {...props}
        >
          {children}
        </Flex>
      </KanbanColumnContext.Provider>
    );
  },
);
KanbanColumn.displayName = "Kanban.Column";

export interface KanbanColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
}

const KanbanColumnHeader = React.forwardRef<
  HTMLDivElement,
  KanbanColumnHeaderProps
>(({ children, count, className, ...props }, ref) => {
  return (
    <Flex
      ref={ref}
      align="center"
      justify="between"
      className={cn("mb-2 px-2", className)}
      {...props}
    >
      <Text as="h3" className="rnx-kanban-column-title">
        {children}
      </Text>
      {count !== undefined && (
        <Box as="span" className="rnx-kanban-column-count px-2.5 py-0.5">
          {count}
        </Box>
      )}
    </Flex>
  );
});
KanbanColumnHeader.displayName = "Kanban.ColumnHeader";

export interface KanbanCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "id"
> {
  id: UniqueIdentifier;
}

const KanbanCard = React.forwardRef<HTMLDivElement, KanbanCardProps>(
  ({ id, children, className, ...props }, ref) => {
    const {
      draggedItemId,
      dragOverItemId,
      dropPosition,
      handleDragStart,
      handleDragOverItem,
      handleDragLeaveItem,
      handleDropItem,
      handleDragEnd,
    } = useKanban();
    const columnId = useKanbanColumn();

    const isDragging = draggedItemId === id;
    const isDragOver = dragOverItemId === id;

    let indicatorStyles = "";
    if (isDragOver && !isDragging) {
      indicatorStyles =
        dropPosition === "before"
          ? "rnx-kanban-card--drag-over-before"
          : "rnx-kanban-card--drag-over-after";
    }

    return (
      <Box
        ref={ref}
        role="listitem"
        tabIndex={0}
        aria-roledescription="draggable card"
        draggable
        onDragStart={(e) => handleDragStart(e, id)}
        onDragOver={(e) => handleDragOverItem(e, id, columnId)}
        onDragLeave={(e) => handleDragLeaveItem(e, id)}
        onDrop={(e) => handleDropItem(e, id)}
        onDragEnd={handleDragEnd}
        className={cn(
          "rnx-kanban-card touch-none",
          isDragging
            ? "rnx-kanban-card--dragging"
            : "rnx-kanban-card--draggable",
          indicatorStyles,
          className,
        )}
        {...props}
      >
        {children}
      </Box>
    );
  },
);
KanbanRoot.displayName = "Kanban";
KanbanColumn.displayName = "Kanban.Column";
KanbanColumnHeader.displayName = "Kanban.ColumnHeader";
KanbanCard.displayName = "Kanban.Card";

// Memoized exports: drag state changes should only re-render the affected
// cards/columns, not every subscriber of the context.
const MemoizedKanbanColumn = React.memo(KanbanColumn);
const MemoizedKanbanColumnHeader = React.memo(KanbanColumnHeader);
const MemoizedKanbanCard = React.memo(KanbanCard);

export const Kanban = Object.assign(KanbanRoot, {
  Column: MemoizedKanbanColumn,
  ColumnHeader: MemoizedKanbanColumnHeader,
  Card: MemoizedKanbanCard,
});
