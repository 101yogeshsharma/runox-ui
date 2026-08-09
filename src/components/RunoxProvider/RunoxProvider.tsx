"use client";
import React, { ReactNode } from "react";
import {
  ThemeProvider,
  type ThemeConfig,
} from "../ThemeProvider/ThemeProvider";
import { MakeWayProvider } from "../Motion/MakeWayContext";
import { LazyMotionProvider } from "../Motion/LazyMotionProvider";
import { ToastProvider, type ToastPosition } from "../Toast/Toast";

export interface RunoxProviderProps {
  children: ReactNode;
  defaultTheme?: "dark" | "light" | "system";
  defaultConfig?: Partial<ThemeConfig>;
  enableSystem?: boolean;
  storageKey?: string;
  toastPosition?: ToastPosition;
}

export function RunoxProvider({
  children,
  toastPosition,
  ...themeProps
}: RunoxProviderProps) {
  return (
    <ThemeProvider {...themeProps}>
      <MakeWayProvider>
        <LazyMotionProvider>
          <ToastProvider position={toastPosition}>{children}</ToastProvider>
        </LazyMotionProvider>
      </MakeWayProvider>
    </ThemeProvider>
  );
}
