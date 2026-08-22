"use client";

import React, { useRef, useState, useEffect } from "react";
import { useThrottledEvent } from "../../hooks/use-throttled-event";
import { cn } from "../../utils/cn";
import "./VirtualList.css";

import { Box } from "../../atoms/Box";
import { rnx } from "../../utils/rnx";

/**
 * Props for the VirtualList component.
 */
export interface VirtualListProps<T> {
  items: T[];
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
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const parentRef = useRef<HTMLDivElement>(null);

  useThrottledEvent(
    "scroll",
    () => {
      if (parentRef.current) {
        setScrollTop(parentRef.current.scrollTop);
      }
    },
    parentRef,
    16
  );

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    const handleResize = () => setViewportHeight(el.clientHeight);
    handleResize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(el);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    count - 1,
    Math.ceil((scrollTop + (viewportHeight || itemHeight)) / itemHeight) +
      overscan
  );

  const virtualItems: Array<{ index: number; start: number; size: number }> =
    [];
  if (count > 0) {
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
    getTotalSize: () => count * itemHeight,
    getVirtualItems: () => virtualItems,
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

const VirtualListItem = React.memo(VirtualListItemComponent) as typeof VirtualListItemComponent;

export function VirtualList<T>({
  items,
  renderItem,
  height = "400px",
  itemHeight = 50,
  className,
  itemClassName,
}: VirtualListProps<T>) {
  const estimateSize = React.useCallback(() => itemHeight, [itemHeight]);
  const virtualOptions = React.useMemo(() => ({
    count: items.length,
    estimateSize,
    overscan: 5,
  }), [items.length, estimateSize]);

  const rowVirtualizer = useVirtualization(virtualOptions);

  return (
    <Box
      {...rnx({ component: 'VirtualList' })}
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
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
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
