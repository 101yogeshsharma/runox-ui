<div align="center">
  <img src="https://raw.githubusercontent.com/101yogeshsharma/runox-ui/main/assets/hero.svg" alt="Runox UI Hero Banner" />
</div>

# @runox/ui

[![NPM Version](https://img.shields.io/npm/v/@runox/ui.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/@runox/ui)
[![NPM Downloads](https://img.shields.io/npm/dm/@runox/ui.svg?style=flat-square)](https://www.npmjs.com/package/@runox/ui)
[![License](https://img.shields.io/npm/l/@runox/ui.svg?style=flat-square)](https://github.com/101yogeshsharma/runox-ui/blob/main/LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@runox/ui.svg?style=flat-square)](https://bundlephobia.com/package/@runox/ui)

The AI-native React component library and design system — 68 accessible, glassmorphic components with dot-notation APIs, built-in testing utilities, and machine-readable agent instrumentation.

## Features

- **68 Components**: From primitives (`Box`, `Flex`, `Grid`) to complex interactive components (Kanban, DataTable, VirtualList, AI Chat) — all fully typed.
- **Dot-Notation APIs**: Composed components use clean namespaces — `Modal.Header`, `Card.Title`, `Accordion.Item`.
- **Glassmorphism**: Components natively support translucent layers, blurred backgrounds, and subtle glow borders.
- **Dark-First Theming**: Comprehensive design tokens (colors, typography, shadows, motion) with light mode and system preference support via `RunoxProvider`.
- **Accessible by Default**: WAI-ARIA patterns, roving tabindex, focus management, scoped Escape handling, and `useReducedMotion` support built in.
- **Built for Testing**: Ship deterministic tests with the `@runox/ui/test` setup helper, `container` portal props, and `disableExitAnimation` — no fake-timer coupling.
- **AI-Native**: Machine-readable agent instrumentation (`data-rnx` attributes), an MCP server for AI assistants, and a component registry for CLI-driven installs.
- **Explicit CSS**: Import the bundled stylesheet once from your application entry point so tokens and component styles are available to root and subpath imports.

## Installation

```bash
npm install @runox/ui
```

### Peer Dependencies

Install React and the peer dependencies for the components you use:

```bash
npm install react react-dom lucide-react
```

Charts, forms, image cropping, and syntax highlighting also require their corresponding peer packages listed in `package.json`.

## Usage

### Setup

Import the stylesheet once, then optionally wrap your application with `RunoxProvider` for theme, motion, and toast support.

### Example

```tsx
import "@runox/ui/styles.css";
import { Button, Card, Text } from "@runox/ui";

function App() {
  return (
    <Card variant="glass" interactive>
      <Text variant="h3">Modern Experience</Text>
      <div>
        <Text color="secondary">Enjoy our beautiful design system.</Text>
        <Button variant="solid" color="success">
          Get Started
        </Button>
      </div>
    </Card>
  );
}
```

## Components

The full component inventory — including dot-notation namespace members
(e.g. `Modal.Header`, `Table.Row`) and stable subpath imports — is
**auto-generated** in [`COMPONENTS.md`](./COMPONENTS.md). Regenerate it with:

```bash
node scripts/generate-components-md.js
```

### Quick categories

- **Layout & Typography** — `Text`, `Grid`, `Flex`, `Container`, `Spacer`, `Show`
- **Base UI** — `Button`, `Input`, `Card`, `Badge`, `Avatar`
- **Overlays** — `Modal`, `Drawer`, `AlertDialog`, `Popover`, `Tooltip`, `HoverCard`
- **Menus & Selection** — `Dropdown`, `Select`, `ContextMenu`, `Command`, `NavigationMenu`
- **Data Display** — `Table` / `DataTable`, `Timeline`, `TreeView`, `Kanban`, `VirtualList`
- **Feedback** — `Toast`, `Alert`, `Progress`, `Skeleton`, `Spinner`, `ErrorBoundary`
- **Motion** — `Motion`, `MakeWayProvider` (scroll-driven reveal)

All overlay components accept a `container?: HTMLElement` prop to portal into
a custom element (useful for tests and shadow DOM), and most expose
`disableExitAnimation` for deterministic testing.

## Providers: RunoxProvider vs MakeWayProvider

- **`RunoxProvider`** — application-level provider for theming, motion
  preferences, and global configuration. Wrap your app once.
- **`MakeWayProvider`** — optional, layout-scoped provider that enables the
  scroll-driven reveal system (`Motion` components push content aside as they
  enter the viewport). Use it only around the section of your app that uses
  scroll-reveal; without it, `Motion` components render statically and no
  error is thrown (`useMakeWayOptional`).

```tsx
import { RunoxProvider, MakeWayProvider } from "@runox/ui";

// Theming only:
<RunoxProvider>
  <App />
</RunoxProvider>;

// With scroll reveals:
<RunoxProvider>
  <MakeWayProvider>
    <LandingPage />
  </MakeWayProvider>
</RunoxProvider>;
```

## Testing your app with @runox/ui

The package ships a test-setup helper that installs every browser shim its
components rely on in jsdom/happy-dom environments:

```ts
// vitest.setup.ts
import { setupRunoxTests } from "@runox/ui/test";

setupRunoxTests();
```

This installs mocks for `matchMedia`, `ResizeObserver`, `PointerEvent`,
`scrollIntoView`, and pointer-capture methods, plus Testing Library cleanup.
Pass options to skip any individual shim. For deterministic animation tests,
use the `disableExitAnimation` prop on overlays instead of fake timers, and
lower `exitDurationMs` on `ToastProvider`.

## Module Format

**ESM is the recommended module format.** The package ships dual CJS + ESM
builds with full `types` conditions on every subpath export, but modern
bundlers (Vite, Next.js, Turbopack) get the best tree-shaking from the ESM
entry. Node.js consumers should use `import` syntax or ensure their runner
respects the export map's `import` condition.

## Documentation

The documentation and interactive examples for this component library are maintained in the [runox-docs](https://github.com/101yogeshsharma/runox-docs) repository.

For detailed component APIs, usage examples, and design system guidelines, please visit our official documentation site.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes. Highlights of **v0.4.0**:

- `container` portal prop on all 12 overlay components
- Deterministic testing: `@runox/ui/test` setup helper + `disableExitAnimation`
- New `ErrorBoundary` component
- Generic `Select<TValue>`, typed DataTable `accessorKey`, exported prop types
- `useReducedMotion` hook; complete dot-notation component namespaces

## Deprecation Policy

Runox UI follows [Semantic Versioning (SemVer)](https://semver.org/). To ensure predictable and smooth upgrades:

1. **Notice Period**: Deprecated props and components will remain functional and emit development-time `console.warn` warnings and JSDoc `@deprecated` tags for at least one minor release cycle prior to removal.
2. **Breaking Changes**: Removals and non-backward-compatible API changes are reserved exclusively for **MAJOR** version bumps (`v1.0.0`, `v2.0.0`).
3. **Migration Guidance**: Every deprecated API will include migration alternatives directly in the deprecation message and CHANGELOG.

## Development

### Commands

- `npm run build` - Builds the package using `tsup`.
- `npm run typecheck` - Checks TypeScript without emitting files.
- `npm run lint` - Runs the zero-warning ESLint gate.
- `npm run test` - Runs the Vitest test suite.
- `npm run test:exports` - Verifies package exports against generated artifacts.
- `npm run test:package` - Installs the packed tarball in a fresh temporary project.
