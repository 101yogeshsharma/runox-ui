
import type { RunoxTheme } from "../../utils/defineTheme";
import { Theme, ThemeDensity, ThemeRadius} from "./ThemeProvider.types";

export interface ThemeConfig {
  theme: Theme;
  primaryColor: string;
  radius: ThemeRadius;
  density: ThemeDensity;
  disableDevWarnings?: boolean;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: Theme;
  defaultTheme?: Theme;
  defaultConfig?: Partial<ThemeConfig>;
  enableSystem?: boolean;
  storageKey?: string;
  tokens?: RunoxTheme;
  container?: HTMLElement | null;
}

export interface ThemeProviderState {
  config: ThemeConfig;
  setConfig: (config: Partial<ThemeConfig>) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}