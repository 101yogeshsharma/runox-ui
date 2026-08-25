"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "../../utils/cn";
import "./VirtualList.css";

import { Box } from "../../atoms/Box";
import { rnx } from "../../utils/rnx";

/**
 * Props for the VirtualList component.
 */
export interface VirtualListProps<T> {
  items: T[];
  /**
   * Renders a single row. IMPORTANT: pass a stable reference (module-level
   * function or useCallback) — an inline arrow recreated each render defeats
   * row memoization and re-renders every visible row.
   */
  renderItem: (item: T, index: number) => React.ReactNode;
  height?: string | number;
  itemHeight?: number;
  className?: string;
  itemClassName?: string;
}

const VIRTUAL_LIST_CONTAINER_CLASS = "rnx-virtual-list overflow-auto";
const VIRTUAL_LIST_INNER_CLASS = "relative w-full";
const VIRTUAL_LIST_ITEM_CLASS =
  "rnx-virtual-list-item absolute top-0 left-0 w-full";

function useVirtualization(options: {
  count: number;
  estimateSize: () => number;
  overscan?: number;
}) {
  const { count, estimateSize, overscan = 5 } = options;
  const itemHeight = estimateSize();
  // Only the *visible range* lives in state — not the raw scroll offset.
  // Scrolling within the same range causes zero React re-renders; the browser
  // scrolls natively and items are absolutely positioned so they move for free.
  const [range, setRange] = useState({ start: 0, end: 0 });
  const [viewportHeight, setViewportHeight] = useState(0);
  const parentRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    const updateRange = () => {
      const scrollTop = el.scrollTop;
      const vh = el.clientHeight || itemHeight;
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const end = Math.min(
        count - 1,
        Math.ceil((scrollTop + vh) / itemHeight) + overscan,
      );
      setRange((prev) =>
        prev.start === start && prev.end === end ? prev : { start, end },
      );
    };

    // rAF-throttled scroll handling: coalesces multiple scroll events per frame.
    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateRange();
      });
    };

    const handleResize = () => {
      setViewportHeight(el.clientHeight);
      updateRange();
    };

    handleResize();
    el.addEventListener("scroll", onScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(el);
    }

    return () => {
      el.removeEventListener("scroll", onScroll);
      if (resizeObserver) resizeObserver.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [count, itemHeight, overscan]);

  const startIndex = Math.max(0, range.start);
  const endIndex = Math.min(count - 1, range.end);

  const virtualItems: Array<{ index: number; start: number; size: number }> =
    [];
  if (count > 0 && endIndex >= startIndex) {
    for (let i = startIndex; i <= endIndex; i++) {
      virtualItems.push({
        index: i,
        start: i * itemHeight,
        size: itemHeight,
      });
    }
  }

  return {
    parentRef,
    totalSize: count * itemHeight,
    virtualItems,
  };
}

interface VirtualListItemProps<T> {
  virtualRow: { index: number; start: number; size: number };
  item: T;
  itemClassName?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
}

function VirtualListItemComponent<T>({
  virtualRow,
  item,
  itemClassName,
  renderItem,
}: VirtualListItemProps<T>) {
  return (
    <Box
      className={cn(VIRTUAL_LIST_ITEM_CLASS, itemClassName)}
      style={{
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start}px)`,
      }}
    >
      {renderItem(item, virtualRow.index)}
    </Box>
  );
}

const VirtualListItem = React.memo(
  VirtualListItemComponent,
) as typeof VirtualListItemComponent;

export function VirtualList<T>({
  items,
  renderItem,
  height = "400px",
  itemHeight = 50,
  className,
  itemClassName,
}: VirtualListProps<T>) {
  if (!Number.isFinite(itemHeight) || itemHeight <= 0) {
    throw new Error(
      "VirtualList itemHeight must be a finite number greater than zero",
    );
  }

  const estimateSize = React.useCallback(() => itemHeight, [itemHeight]);
  const virtualOptions = React.useMemo(
    () => ({
      count: items.length,
      estimateSize,
      overscan: 5,
    }),
    [items.length, estimateSize],
  );

  const rowVirtualizer = useVirtualization(virtualOptions);

  return (
    <Box
      {...rnx({ component: "VirtualList" })}
      ref={rowVirtualizer.parentRef}
      className={cn(VIRTUAL_LIST_CONTAINER_CLASS, className)}
      style={{
        height,
        width: "100%",
      }}
    >
      <Box
        className={VIRTUAL_LIST_INNER_CLASS}
        style={{
          height: `${rowVirtualizer.totalSize}px`,
        }}
      >
        {rowVirtualizer.virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index];
          return (
            <VirtualListItem
              key={virtualRow.index}
              virtualRow={virtualRow}
              item={item}
              itemClassName={itemClassName}
              renderItem={renderItem}
            />
          );
        })}
      </Box>
    </Box>
  );
}
VirtualList.displayName = "VirtualList";
