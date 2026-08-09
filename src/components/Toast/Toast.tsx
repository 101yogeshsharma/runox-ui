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
import { Box } from "../../atoms/Box";
import { Text } from "../../atoms/Text";
import { Button } from "../Button";
import { useTheme } from "../ThemeProvider/ThemeProvider";
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

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = "bottom-right",
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addToast = useCallback((message: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...message, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "closing" } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  // Group toasts by their resolved position
  const toastsByPosition = toasts.reduce(
    (acc, toast) => {
      const pos = toast.position || position;
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push(toast);
      return acc;
    },
    {} as Record<ToastPosition, ToastMessage[]>
  );

  const activePositions = Object.keys(toastsByPosition) as ToastPosition[];

  const contextValue = useMemo(
    () => ({
      toast: addToast,
      dismiss: removeToast,
    }),
    [addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {activePositions.map((pos) => (
              <Box
                key={pos}
                className={cn(
                  "rnx-toast-viewport",
                  `rnx-toast-viewport--${pos}`
                )}
              >
                {toastsByPosition[pos].map((t) => (
                  <ToastItem
                    key={t.id}
                    toast={t}
                    onRemove={() => removeToast(t.id)}
                  />
                ))}
              </Box>
            ))}
          </>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({
  toast,
  onRemove,
}) => {
  const { config } = useTheme();
  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleClose = () => {
    onRemove();
  };

  const isClosing = toast.status === "closing";

  return (
    <Box
      role="status"
      aria-live="polite"
      className={cn(
        "rnx-toast",
        `rnx-toast--${toast.variant || "info"}`,
        `rnx-toast--${toast.size || "md"}`,
        isClosing ? "rnx-toast--closing" : "rnx-toast--opening",
        `rounded-${config.radius}`
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
        aria-label="Close toast"
      >
        <X className="h-4 w-4" />
      </Button>
    </Box>
  );
};
