"use client";
import { Box } from "../../atoms/Box";
import { rnx } from "../../utils/rnx";

import { GripVertical } from "lucide-react";
import { cn } from "../../utils/cn";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";

const ResizableContext = createContext<{
  direction: "horizontal" | "vertical";
}>({ direction: "horizontal" });

const ResizablePanelGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    direction?: "horizontal" | "vertical";
  }
>(({ className, direction = "horizontal", ...props }, ref) => {
  return (
    <ResizableContext.Provider value={{ direction }}>
      <Box
        ref={ref}
        {...rnx({
          component: "Resizable",
          variant: direction,
        })}
        className={cn(
          "flex h-full w-full",
          direction === "vertical" ? "flex-col" : "flex-row",
          className,
        )}
        data-panel-group-direction={direction}
        {...props}
      />
    </ResizableContext.Provider>
  );
});
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
  }
>(
  (
    { className, defaultSize, minSize = 0, maxSize = 100, style, ...props },
    ref,
  ) => {
    return (
      <Box
        ref={ref}
        className={cn(
          "relative flex overflow-hidden rounded-[var(--radius)] border border-border bg-card",
          className,
        )}
        style={
          {
            flexGrow: `var(--panel-flex-grow, ${defaultSize !== undefined ? defaultSize : 1})`,
            flexShrink: 1,
            flexBasis: 0,
            minWidth: 0,
            minHeight: 0,
            overflow: "hidden",
            ...style,
          } as React.CSSProperties
        }
        data-resizable-panel
        data-min-size={minSize}
        data-max-size={maxSize}
        {...props}
      />
    );
  },
);
ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { withHandle?: boolean }
>(({ className, withHandle, ...props }, ref) => {
  const { direction } = useContext(ResizableContext);
  const handleRef = useRef<HTMLDivElement>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement) => {
      handleRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref],
  );

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    let isDragging = false;
    let startPos = 0;
    let prevPanel: HTMLElement | null = null;
    let nextPanel: HTMLElement | null = null;
    let prevStartSize = 0;
    let nextStartSize = 0;
    let totalSize = 0;
    let containerSize = 0;
    let savedCursor = "";
    let savedUserSelect = "";

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      isDragging = true;
      e.preventDefault();

      handle.setPointerCapture(e.pointerId);

      prevPanel = handle.previousElementSibling as HTMLElement;
      nextPanel = handle.nextElementSibling as HTMLElement;

      if (!prevPanel || !nextPanel) return;

      const group = handle.parentElement;
      if (!group) return;

      const prevFlex = parseFloat(getComputedStyle(prevPanel).flexGrow) || 50;
      const nextFlex = parseFloat(getComputedStyle(nextPanel).flexGrow) || 50;

      const prevRect = prevPanel.getBoundingClientRect();
      const nextRect = nextPanel.getBoundingClientRect();

      if (direction === "horizontal") {
        startPos = e.clientX;
        prevStartSize = prevFlex;
        nextStartSize = nextFlex;
        totalSize = prevStartSize + nextStartSize;
        containerSize = prevRect.width + nextRect.width;
        savedCursor = document.body.style.cursor;
        document.body.style.cursor = "col-resize";
      } else {
        startPos = e.clientY;
        prevStartSize = prevFlex;
        nextStartSize = nextFlex;
        totalSize = prevStartSize + nextStartSize;
        containerSize = prevRect.height + nextRect.height;
        savedCursor = document.body.style.cursor;
        document.body.style.cursor = "row-resize";
      }

      savedUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = "none";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !prevPanel || !nextPanel) return;

      let delta = 0;
      if (direction === "horizontal") {
        delta = e.clientX - startPos;
      } else {
        delta = e.clientY - startPos;
      }

      if (containerSize === 0) return;

      const deltaPercentage = (delta / containerSize) * totalSize;

      let newPrevSize = prevStartSize + deltaPercentage;
      let newNextSize = nextStartSize - deltaPercentage;

      const group = handle.parentElement;
      const allPanels = Array.from(
        group?.querySelectorAll("[data-resizable-panel]") || [],
      );
      const totalGroupFlex = allPanels.reduce(
        (sum, p) =>
          sum + (parseFloat(getComputedStyle(p as HTMLElement).flexGrow) || 0),
        0,
      );

      const prevMin =
        (parseFloat(prevPanel.getAttribute("data-min-size") || "0") / 100) *
        totalGroupFlex;
      const prevMax =
        (parseFloat(prevPanel.getAttribute("data-max-size") || "100") / 100) *
        totalGroupFlex;
      const nextMin =
        (parseFloat(nextPanel.getAttribute("data-min-size") || "0") / 100) *
        totalGroupFlex;
      const nextMax =
        (parseFloat(nextPanel.getAttribute("data-max-size") || "100") / 100) *
        totalGroupFlex;

      if (newPrevSize < prevMin) {
        newPrevSize = prevMin;
        newNextSize = totalSize - prevMin;
      } else if (newPrevSize > prevMax) {
        newPrevSize = prevMax;
        newNextSize = totalSize - prevMax;
      }

      if (newNextSize < nextMin) {
        newNextSize = nextMin;
        newPrevSize = totalSize - nextMin;
      } else if (newNextSize > nextMax) {
        newNextSize = nextMax;
        newPrevSize = totalSize - nextMax;
      }

      prevPanel.style.setProperty("--panel-flex-grow", newPrevSize.toString());
      nextPanel.style.setProperty("--panel-flex-grow", newNextSize.toString());
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        // On pointercancel the browser implicitly releases capture, so this
        // may throw an InvalidPointerId DOMException — suppress it safely.
        try {
          handle.releasePointerCapture(e.pointerId);
        } catch {
          // intentionally suppressed
        }
        document.body.style.cursor = savedCursor;
        document.body.style.userSelect = savedUserSelect;
      }
    };

    handle.addEventListener("pointerdown", onPointerDown);
    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", onPointerUp);
    handle.addEventListener("pointercancel", onPointerUp);

    return () => {
      handle.removeEventListener("pointerdown", onPointerDown);
      handle.removeEventListener("pointermove", onPointerMove);
      handle.removeEventListener("pointerup", onPointerUp);
      handle.removeEventListener("pointercancel", onPointerUp);
    };
  }, [direction]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const handle = handleRef.current;
    if (!handle) return;
    const prevPanel = handle.previousElementSibling as HTMLElement;
    const nextPanel = handle.nextElementSibling as HTMLElement;
    if (!prevPanel || !nextPanel) return;

    let delta = 0;
    if (direction === "horizontal") {
      if (e.key === "ArrowLeft") delta = -5;
      else if (e.key === "ArrowRight") delta = 5;
    } else if (e.key === "ArrowUp") {
      delta = -5;
    } else if (e.key === "ArrowDown") {
      delta = 5;
    }

    if (delta !== 0) {
      e.preventDefault();
      const prevFlex =
        Number.parseFloat(getComputedStyle(prevPanel).flexGrow) || 50;
      const nextFlex =
        Number.parseFloat(getComputedStyle(nextPanel).flexGrow) || 50;
      const totalSize = prevFlex + nextFlex;
      const newPrev = Math.max(0, Math.min(totalSize, prevFlex + delta));
      const newNext = totalSize - newPrev;
      prevPanel.style.setProperty("--panel-flex-grow", newPrev.toString());
      nextPanel.style.setProperty("--panel-flex-grow", newNext.toString());
    }
  };

  return (
    <Box
      ref={setRefs}
      role="separator"
      tabIndex={0}
      aria-orientation={direction}
      aria-valuenow={50}
      aria-valuemin={0}
      aria-valuemax={100}
      onKeyDown={handleKeyDown}
      className={cn("rnx-resizable-handle", className)}
      data-panel-group-direction={direction}
      {...props}
    >
      {withHandle && (
        <Box className="rnx-resizable-handle__grip">
          <GripVertical className="h-2.5 w-2.5" />
        </Box>
      )}
    </Box>
  );
});
ResizableHandle.displayName = "Resizable.Handle";
ResizablePanel.displayName = "Resizable.Panel";
ResizablePanelGroup.displayName = "Resizable.PanelGroup";

export const Resizable = Object.assign(ResizablePanelGroup, {
  PanelGroup: ResizablePanelGroup,
  Panel: ResizablePanel,
  Handle: ResizableHandle,
});

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
