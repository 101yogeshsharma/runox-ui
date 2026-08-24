"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { applyTheme as applyCustomTheme } from "../../utils/applyTheme";
import { foregroundForBackground } from "../../utils/contrast";
import { Theme } from "./ThemeProvider.types";
import type {
  ThemeProviderProps,
  ThemeProviderState,
  ThemeConfig,
} from "./ThemeProvider.interface";

import "../../styles/globals.css";

const defaultConfigState: ThemeConfig = {
  theme: "system",
  primaryColor: "blue",
  radius: "md",
  density: "comfortable",
  disableDevWarnings: false,
};

const initialState: ThemeProviderState = {
  config: defaultConfigState,
  setConfig: () => null,
  theme: "system",
  setTheme: () => null,
};

const validThemes = new Set<Theme>(["light", "dark", "system"]);
const validRadii = new Set<ThemeConfig["radius"]>([
  "none",
  "sm",
  "md",
  "lg",
  "xl",
]);
const validDensities = new Set<ThemeConfig["density"]>([
  "compact",
  "comfortable",
]);

function sanitizeStoredConfig(value: unknown): Partial<ThemeConfig> {
  if (!value || typeof value !== "object") return {};

  const candidate = value as Record<string, unknown>;
  const sanitized: Partial<ThemeConfig> = {};
  if (typeof candidate.primaryColor === "string" && candidate.primaryColor) {
    sanitized.primaryColor = candidate.primaryColor;
  }
  if (validThemes.has(candidate.theme as Theme)) {
    sanitized.theme = candidate.theme as Theme;
  }
  if (validRadii.has(candidate.radius as ThemeConfig["radius"])) {
    sanitized.radius = candidate.radius as ThemeConfig["radius"];
  }
  if (validDensities.has(candidate.density as ThemeConfig["density"])) {
    sanitized.density = candidate.density as ThemeConfig["density"];
  }
  if (typeof candidate.disableDevWarnings === "boolean") {
    sanitized.disableDevWarnings = candidate.disableDevWarnings;
  }
  return sanitized;
}

function applyPrimaryColor(root: HTMLElement, color: string) {
  if (color.startsWith("#")) {
    delete root.dataset.color;
    root.style.setProperty("--primary", color);
    root.style.setProperty(
      "--primary-foreground",
      foregroundForBackground(color),
    );
  } else {
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-foreground");
    root.dataset.color = color;
  }
}

function applyRadius(root: HTMLElement, radius: ThemeConfig["radius"]) {
  root.style.setProperty(
    "--radius",
    radius === "none" ? "0px" : `var(--radius-${radius})`,
  );
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultConfig,
  enableSystem = true,
  storageKey = "runox-ui-theme",
  tokens,
  container,
  ...props
}: ThemeProviderProps) {
  const [config, setConfigState] = useState<ThemeConfig>(
    // Initialize with defaults only — localStorage is read in a useEffect below
    // to avoid SSR hydration mismatches (server has no localStorage).
    { ...defaultConfigState, theme: defaultTheme, ...defaultConfig },
  );

  // Hydrate from localStorage after mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setConfigState((prev) => ({
          ...prev,
          ...sanitizeStoredConfig(JSON.parse(stored)),
        }));
      }
    } catch {
      // Ignore parse errors
    }
  }, [storageKey]);

  // Synchronize dynamic/controlled props when they change
  useEffect(() => {
    if (props.theme !== undefined) {
      setConfigState((prev) => ({ ...prev, theme: props.theme! }));
    }
  }, [props.theme]);

  const setConfig = useCallback(
    (newConfig: Partial<ThemeConfig>) => {
      setConfigState((prev) => {
        const updated = { ...prev, ...newConfig };
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch (error) {
            console.warn("Failed to save theme config to localStorage", error);
          }
        }
        return updated;
      });
    },
    [storageKey],
  );

  const setTheme = useCallback(
    (t: Theme) => {
      setConfig({ theme: t });
    },
    [setConfig],
  );

  useEffect(() => {
    const root = container || window.document.documentElement;

    const applyTheme = (resolvedTheme: "light" | "dark") => {
      root.classList.remove("light", "dark");
      root.removeAttribute("data-theme");
      root.classList.add(resolvedTheme);
      root.setAttribute("data-theme", resolvedTheme);
    };

    let mediaQuery: MediaQueryList | null = null;
    let mediaListener: ((e: MediaQueryListEvent) => void) | null = null;

    if (config.theme === "system" && enableSystem) {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const resolved = mediaQuery.matches ? "dark" : "light";
      applyTheme(resolved);

      // Keep in sync when the OS theme changes while the app is running
      mediaListener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light");
      };
      mediaQuery.addEventListener("change", mediaListener);
    } else {
      applyTheme(config.theme === "dark" ? "dark" : "light");
    }

    // Dynamic Theming application
    applyPrimaryColor(root, config.primaryColor);

    // Radius application
    applyRadius(root, config.radius);

    // Sync dev warnings
    if (typeof window !== "undefined") {
      (window as any).__RUNOX_DISABLE_WARNINGS__ = config.disableDevWarnings;
    }

    // Density application — skip when using a custom container,
    // as the container owner manages data-density externally
    if (config.density && !container) {
      root.dataset.density = config.density;
    }

    // Apply zero-config theming tokens
    if (tokens) {
      applyCustomTheme(tokens, root);

      // Override primaryColor and radius if provided in tokens
      if (tokens.primaryColor) {
        applyPrimaryColor(root, tokens.primaryColor);
      }
      if (tokens.radius) {
        applyRadius(root, tokens.radius);
      }
    }

    return () => {
      if (mediaQuery && mediaListener) {
        mediaQuery.removeEventListener("change", mediaListener);
      }
    };
  }, [config, enableSystem, tokens, container]);

  const contextValue = useMemo(() => {
    // Merge tokens into config so components reading useTheme().config get the updated values
    const mergedConfig = tokens ? { ...config, ...tokens } : config;
    return {
      config: mergedConfig,
      setConfig,
      theme: config.theme,
      setTheme,
    };
  }, [config, tokens, setConfig, setTheme]);

  return (
    <ThemeProviderContext.Provider value={contextValue} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

export type {
  ThemeConfig,
  ThemeProviderProps,
  ThemeProviderState,
} from "./ThemeProvider.interface";
export type { Theme, ThemeDensity, ThemeRadius } from "./ThemeProvider.types";
