# Runox UI CSS Token Contract

This document defines the CSS custom properties that the `@runox/ui` design system and `ThemeProvider` manage and expose. Every component stylesheet must consume these tokens directly via `var(...)` instead of hardcoding raw pixel values, hex colors, or relying on dynamic Tailwind utility interpolation strings.

---

## 1. Border Radius Tokens

| Token Variable | Description | Default Light/Dark Value | Set By |
| :--- | :--- | :--- | :--- |
| `--radius` | Active border radius for surfaces & components | `var(--radius-md, 12px)` | `ThemeProvider` |
| `--radius-sm` | Small radius scale token | `6px` | Theme CSS |
| `--radius-md` | Medium radius scale token | `12px` | Theme CSS |
| `--radius-lg` | Large radius scale token | `16px` | Theme CSS |
| `--radius-xl` | Extra-large radius scale token | `24px` | Theme CSS |

### Component Radius Conventions:
- **Surface / Modal / Card Root**: `border-radius: var(--radius);`
- **Inner Items / Interactive Elements**: `border-radius: calc(var(--radius) - 2px);`
- **Inputs / Small Badges**: `border-radius: calc(var(--radius) - 4px);`
- **Full Pill / Circle**: `border-radius: 9999px;`

---

## 2. Color Palette Tokens

| Token Variable | Description | Usage |
| :--- | :--- | :--- |
| `--primary` | Main brand / action color | Buttons, active tabs, highlights, links |
| `--primary-foreground` | High-contrast text on `--primary` | Button text, badge text |
| `--background` | Page background | Canvas background |
| `--foreground` | Default text color | Body typography, primary text |
| `--card` | Card & surface background | Cards, modals, sheets, popovers |
| `--card-foreground` | Text color on card surfaces | Card text |
| `--popover` | Overlay / dropdown background | Tooltips, popovers, menus |
| `--popover-foreground` | Text on popovers | Menu text, tooltip text |
| `--secondary` | Secondary action / soft background | Ghost button hover, subtle badges |
| `--secondary-foreground`| Text on secondary surfaces | Secondary button text |
| `--muted` | Subtle surface / disabled background | Disabled inputs, list striping |
| `--muted-foreground` | Muted / placeholder text | Subtitles, helper text, placeholders |
| `--accent` | Hover / interactive item highlight | Menu item hover, list hover |
| `--accent-foreground` | Text on accent surfaces | Hovered menu text |
| `--destructive` | Error / danger state | Error text, danger buttons, invalid inputs |
| `--destructive-foreground` | Text on destructive background | Danger button text |
| `--border` | Default border color | Component outlines, dividers |
| `--ring` | Focus ring outline color | Accessible focus indicators |

---

## 3. Elevation & Focus Tokens

| Token Variable | Description |
| :--- | :--- |
| `--rnx-focus-ring` | Global standard focus ring: `0 0 0 2px var(--background), 0 0 0 4px var(--primary)` |
| `--rnx-focus-ring-inset` | Inset focus ring for inputs: `inset 0 0 0 2px var(--primary)` |
| `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl` | Surface drop-shadow scales |

---

## 4. Density & Scaling Tokens

| Token Variable | Description |
| :--- | :--- |
| `--rnx-space-scale` | Spacing multiplier (`0.85` for compact, `1` for comfortable, `1.15` for spacious) |
| `--rnx-text-scale` | Typography multiplier (`0.9` for compact, `1` for comfortable, `1.1` for spacious) |
