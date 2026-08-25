"use client";
import React, { ReactNode } from "react";
import {
  ThemeProvider,
  type ThemeConfig,
} from "../ThemeProvider/ThemeProvider";
import { Motion } from "../Motion";
import { Toast, type ToastPosition } from "../Toast";

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
      <Motion.MakeWayProvider>
        <Toast.Provider position={toastPosition}>{children}</Toast.Provider>
      </Motion.MakeWayProvider>
    </ThemeProvider>
  );
}

RunoxProvider.displayName = "RunoxProvider";
