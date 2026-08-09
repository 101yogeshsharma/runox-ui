"use client";
import { Box } from "../../atoms/Box";

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
        className={cn(
          "flex h-full w-full",
          direction === "vertical" ? "flex-col" : "flex-row",
          className
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
    ref
  ) => {
    return (
      <Box
        ref={ref}
        className={cn("relative flex", className)}
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
  }
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
    [ref]
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
        group?.querySelectorAll("[data-resizable-panel]") || []
      );
      const totalGroupFlex = allPanels.reduce(
        (sum, p) =>
          sum + (parseFloat(getComputedStyle(p as HTMLElement).flexGrow) || 0),
        0
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

  return (
    <Box
      ref={setRefs}
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px cursor-col-resize touch-none items-center justify-center after:absolute after:inset-y-0 after:start-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:cursor-row-resize data-[panel-group-direction=vertical]:after:start-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2",
        className
      )}
      data-panel-group-direction={direction}
      {...props}
    >
      {withHandle && (
        <Box
          className={cn(
            "bg-border z-10 flex h-4 w-3 items-center justify-center rounded-sm border",
            direction === "vertical" && "rotate-90"
          )}
        >
          <GripVertical className="h-2.5 w-2.5" />
        </Box>
      )}
    </Box>
  );
});
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
