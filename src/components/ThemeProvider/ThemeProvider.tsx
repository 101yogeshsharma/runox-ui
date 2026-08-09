"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import "../../styles/globals.css";

export type ThemeRadius = "none" | "sm" | "md" | "lg" | "xl";

// Safelist for Tailwind dynamically injected classes
// rounded-none rounded-sm rounded-md rounded-lg rounded-xl

type Theme = "dark" | "light" | "system";

export interface ThemeConfig {
  theme: Theme;
  primaryColor: string;
  radius: ThemeRadius;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultConfig?: Partial<ThemeConfig>;
  enableSystem?: boolean;
  storageKey?: string;
}

interface ThemeProviderState {
  config: ThemeConfig;
  setConfig: (config: Partial<ThemeConfig>) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const defaultConfigState: ThemeConfig = {
  theme: "system",
  primaryColor: "zinc",
  radius: "md",
};

const initialState: ThemeProviderState = {
  config: defaultConfigState,
  setConfig: () => null,
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultConfig,
  enableSystem = true,
  storageKey = "runox-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [config, setConfigState] = useState<ThemeConfig>(
    // Initialize with defaults only — localStorage is read in a useEffect below
    // to avoid SSR hydration mismatches (server has no localStorage).
    { ...defaultConfigState, theme: defaultTheme, ...defaultConfig }
  );

  // Hydrate from localStorage after mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ThemeConfig>;
        setConfigState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    [storageKey]
  );

  const setTheme = useCallback(
    (t: Theme) => {
      setConfig({ theme: t });
    },
    [setConfig]
  );

  useEffect(() => {
    const root = window.document.documentElement;

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
      applyTheme(config.theme as "light" | "dark");
    }

    // Dynamic Theming application
    if (config.primaryColor.startsWith("#")) {
      root.style.setProperty("--primary", config.primaryColor);
      let hex = config.primaryColor.replace("#", "");
      if (hex.length === 3) {
        hex = hex
          .split("")
          .map((c) => c + c)
          .join("");
      }
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      const fg = yiq >= 128 ? "#09090b" : "#fafafa";
      root.style.setProperty("--primary-foreground", fg);
    } else {
      root.setAttribute("data-color", config.primaryColor);
    }

    // Radius application
    if (config.radius === "none") {
      root.style.setProperty("--radius", "0px");
    } else {
      root.style.setProperty("--radius", `var(--radius-${config.radius})`);
    }

    return () => {
      if (mediaQuery && mediaListener) {
        mediaQuery.removeEventListener("change", mediaListener);
      }
    };
  }, [config, enableSystem]);

  const contextValue = useMemo(
    () => ({
      config,
      setConfig,
      theme: config.theme,
      setTheme,
    }),
    [config, setConfig, setTheme]
  );

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
