"use client";
import React, { ReactNode } from "react";
import {
  ThemeProvider,
  type ThemeConfig,
} from "../ThemeProvider/ThemeProvider";
import { MakeWayProvider } from "../Motion/MakeWayContext";
import { ToastProvider, type ToastPosition } from "../Toast/Toast";

/**
 * Props for the RunoxProvider component.
 */
export interface RunoxProviderProps {
  children: ReactNode;
  theme?: "dark" | "light" | "system";
  defaultTheme?: "dark" | "light" | "system";
  defaultConfig?: Partial<ThemeConfig>;
  enableSystem?: boolean;
  storageKey?: string;
  toastPosition?: ToastPosition;
  tokens?: import("../../utils/defineTheme").RunoxTheme;
  container?: HTMLElement | null;
}

export function RunoxProvider({
  children,
  toastPosition,
  ...themeProps
}: RunoxProviderProps) {
  return (
    <ThemeProvider {...themeProps}>
      <MakeWayProvider>
        <ToastProvider position={toastPosition}>{children}</ToastProvider>
      </MakeWayProvider>
    </ThemeProvider>
  );
}

RunoxProvider.displayName = "RunoxProvider";
