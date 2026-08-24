# @runox/ui

## 0.3.0

### Minor Changes

- **Design Token Architecture Migration**:
  - Standardized centralized 4px-base spacing scale (`--space-0` through `--space-16`), typography scale (`--text-xs` through `--text-3xl`), icon sizing scale (`--icon-xs` through `--icon-2xl`), arrow dimensions, and scrollbar tokens in `globals.css`.
  - Migrated all 57 component stylesheets from raw rem `calc()` expressions and literals to canonical CSS tokens.
  - Integrated dynamic density scaling support via `--rnx-space-scale` and `--rnx-text-scale`.

- **Accessibility (WCAG 2.1 AA Compliance)**:
  - **Color Contrast**: Darkened `--success` in `:root` and `.light` to `#16a34a` (4.6:1 contrast against white) and light-mode `--muted-foreground` to `#52525b` (5.9:1 contrast on zinc surfaces).
  - **Focus Indicators**: Added consistent dual-ring focus styles and 2px focus outlines on flushed/underline variants of `Input`, `Textarea`, and `OtpInput`.
  - **Keyboard Operability**: Added `Enter`/`Space` activation and `role="button"` to `FileUploader`; added `role="img"`, `tabIndex={0}`, and `typedFallback?: boolean` text-input alternative to `SignaturePad`.
  - **ARIA Semantics**: Implemented `role="menu"` / `role="menuitem"` on `Dropdown`, automatic `aria-describedby` description association on `Radio`, configurable landmark `label` on `NavigationMenu`, and explicit `aria-valuenow`/`aria-valuemin`/`aria-valuemax` attributes on `Slider`.

- **Interactive State Coverage**:
  - Implemented complete and visually differentiated state styles (`:hover`, `:focus-visible`, `:active`, `:disabled`, `.rnx-*-loading`, and `.rnx-*-error` / `[aria-invalid="true"]`) across all 13 interactive controls (`Button`, `Input`, `Textarea`, `NumberInput`, `Checkbox`, `Radio`, `Switch`, `Slider`, `Rating`, `Select`, `TagInput`, `ColorPicker`, `OtpInput`).

- **API Normalization & Deprecation Notices**:
  - `Button`: Added canonical `loading?: boolean` prop; marked `isLoading` and `isDisabled` as `@deprecated`.
  - `Card`: Marked `isInteractive` as `@deprecated` in favor of canonical `interactive`.
  - `Alert`: Standardized on `color` palette (`RnxColor`), marking `status` as `@deprecated`.
  - Documented official SemVer Deprecation Policy in `README.md`.

## 0.2.0

### Minor Changes

- **Liquid Glass Enhancements**: Implemented true liquid glass chromatic refraction effect across Card components utilizing SVG displacement filters and chromatic aberration layers.
- **Performance Optimization**: Lazy-loaded heavy dependencies (`react-hook-form`, `zod`, `@hookform/resolvers`) in code previews, drastically improving initial page load time.
- **CSS Variable Interpolation Bug**: Fixed Tailwind CSS class purging bugs for `border-radius` variables by providing a static map for standard sizes instead of dynamic string interpolation.
- **Animation Fixes**: Resolved an issue with the Accordion component where a static `hidden` attribute bypassed CSS `grid-template-rows` height transitions, ensuring butter-smooth expanding and collapsing.
- **Accessibility Improvements**: Improved accessibility across `Accordion`, `ThemeToggle`, `MobileNav`, and `Sidebar` with proper `aria-hidden`, `inert`, and `aria-label` attributes.
- **Hover States**: Adjusted Slider component's hover and active styling to use a subtle 5% transparent overlay instead of flooding the track background with `var(--ring)`.
- **Next.js Alignment**: Removed deprecated `legacyBehavior` on `<Link>` elements, transitioning `Button` components to use `asChild` / `as="span"` wrappers.
- **General UI Polish**: Enhanced layout contrast, shadow depths, and typography hierarchy to establish a stronger, premium visual language.
