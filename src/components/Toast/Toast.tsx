"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { rnx } from "../../utils/rnx";
import { Box } from "../../atoms/Box";
import { Text } from "../../atoms/Text";
import { Button } from "../Button";
import { TOAST_EXIT_DURATION_MS } from "../../internal/timings";
// Uses: Button
import "./Toast.css";

export type ToastVariant = "info" | "success" | "warning" | "danger";
export type ToastSize = "sm" | "md" | "lg";
export type ToastPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

export interface ToastMessage {
  id: string;
  title?: string;
  description: string;
  variant?: ToastVariant;
  size?: ToastSize;
  duration?: number;
  position?: ToastPosition;
  status?: "open" | "closing";
}

interface ToastContextValue {
  toast: (message: Omit<ToastMessage, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Toast notification system.
 *
 * Wrap your app in `ToastProvider`, then call `useToast().toast({ title })`
 * from anywhere below it. Viewports are grouped by position and portaled to
 * `document.body` (or the `container` prop). Use `TOAST_STICKY` as the
 * duration for toasts that never auto-dismiss.
 *
 * @example
 * ```tsx
 * <ToastProvider position="bottom-right">
 *   <App />
 * </ToastProvider>
 *
 * const { toast } = useToast();
 * toast({ title: "Saved", variant: "success", duration: 3000 });
 * ```
 */
export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  /**
   * Duration in ms for the exit (closing) animation before a dismissed toast
   * is removed from the DOM. Lower this in tests to avoid fake-timer coupling.
   * @default 200
   */
  exitDurationMs?: number;
  /**
   * Element to portal the toast viewports into. Defaults to `document.body`.
   * Useful for tests or rendering inside a specific container.
   */
  container?: HTMLElement;
}

/** Sentinel duration for toasts that never auto-dismiss. */
export const TOAST_STICKY = Infinity;

const ToastProvider = React.forwardRef<HTMLDivElement, ToastProviderProps>(
  function ToastProvider(
    {
      children,
      position = "bottom-right",
      exitDurationMs = TOAST_EXIT_DURATION_MS,
      container,
    },
    ref,
  ) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [mounted, setMounted] = useState(false);
    const removalTimers = React.useRef<
      Map<string, ReturnType<typeof setTimeout>>
    >(new Map());
    const exitDurationRef = React.useRef(exitDurationMs);
    exitDurationRef.current = exitDurationMs;
    const toastIdCounter = React.useRef(0);

    useEffect(() => {
      setMounted(true);
    }, []);

    const addToast = useCallback((message: Omit<ToastMessage, "id">) => {
      // Monotonic counter instead of Math.random: deterministic and unique
      // within a provider lifetime (snapshot-test friendly).
      const id = `toast-${++toastIdCounter.current}`;
      setToasts((prev) => [...prev, { ...message, id }]);
    }, []);

    const removeToast = useCallback((id: string) => {
      setToasts((prev) => {
        const toast = prev.find((item) => item.id === id);
        if (!toast || toast.status === "closing") return prev;
        return prev.map((t) => (t.id === id ? { ...t, status: "closing" } : t));
      });
      if (removalTimers.current.has(id)) return;
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        removalTimers.current.delete(id);
      }, exitDurationRef.current);
      removalTimers.current.set(id, timer);
    }, []);

    React.useEffect(() => {
      const timers = removalTimers.current;
      return () => {
        timers.forEach((timer) => clearTimeout(timer));
        timers.clear();
      };
    }, []);

    // Group toasts by their resolved position
    const toastsByPosition = toasts.reduce(
      (acc, toast) => {
        const pos = toast.position || position;
        if (!acc[pos]) acc[pos] = [];
        acc[pos].push(toast);
        return acc;
      },
      {} as Record<ToastPosition, ToastMessage[]>,
    );

    const activePositions = Object.keys(toastsByPosition) as ToastPosition[];

    const contextValue = useMemo(
      () => ({
        toast: addToast,
        dismiss: removeToast,
      }),
      [addToast, removeToast],
    );

    return (
      <ToastContext.Provider value={contextValue}>
        <Box ref={ref}>{children}</Box>
        {mounted &&
          typeof document !== "undefined" &&
          createPortal(
            <>
              {activePositions.map((pos) => (
                <Box
                  key={pos}
                  className={cn(
                    "rnx-toast-viewport",
                    `rnx-toast-viewport--position-${pos}`,
                  )}
                >
                  {toastsByPosition[pos].map((t) => (
                    <MemoizedToastItem
                      key={t.id}
                      toast={t}
                      onRemove={removeToast}
                      removeArg={t.id}
                    />
                  ))}
                </Box>
              ))}
            </>,
            container ?? document.body,
          )}
      </ToastContext.Provider>
    );
  },
);
ToastProvider.displayName = "Toast.Provider";

const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onRemove: (id: string) => void;
  removeArg: string;
}> = ({ toast, onRemove, removeArg }) => {
  useEffect(() => {
    // `??` (not `||`) so duration: 0 / Infinity means "never auto-dismiss".
    const duration = toast.duration ?? 5000;
    if (!Number.isFinite(duration)) return undefined;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- timer must not reset when the (stable) onRemove callback identity changes
  }, [toast.duration]);

  const handleClose = () => {
    onRemove(removeArg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      handleClose();
    }
  };

  const isClosing = toast.status === "closing";

  return (
    <Box
      role="status"
      aria-live="polite"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...rnx({
        component: "Toast",
        variant: toast.variant || "info",
        state: isClosing ? "closed" : "open",
      })}
      className={cn(
        "rnx-toast",
        `rnx-toast--variant-${toast.variant || "info"}`,
        `rnx-toast--size-${toast.size || "md"}`,
        isClosing ? "rnx-toast--closing" : "rnx-toast--opening",
      )}
    >
      <Box className="rnx-toast-content">
        {toast.title && (
          <Text variant="body-sm" weight="medium" className="rnx-toast-title">
            {toast.title}
          </Text>
        )}
        {toast.description && (
          <Text variant="body-sm" className="rnx-toast-description">
            {toast.description}
          </Text>
        )}
      </Box>
      <Button
        variant="ghost"
        size="icon"
        className="rnx-toast-close"
        onClick={handleClose}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </Button>
    </Box>
  );
};
ToastProvider.displayName = "Toast.Provider";
ToastItem.displayName = "Toast.Item";

const MemoizedToastItem = React.memo(ToastItem);

export const Toast = {
  Provider: ToastProvider,
  Item: MemoizedToastItem,
  useToast,
  /** Sentinel duration for toasts that never auto-dismiss. */
  STICKY: TOAST_STICKY,
};
