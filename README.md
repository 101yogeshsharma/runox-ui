<div align="center">
  <img src="https://raw.githubusercontent.com/101yogeshsharma/runox-ui/main/assets/hero.svg" alt="Runox UI Hero Banner" />
</div>

# @runox/ui

[![NPM Version](https://img.shields.io/npm/v/@runox/ui.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/@runox/ui)
[![NPM Downloads](https://img.shields.io/npm/dm/@runox/ui.svg?style=flat-square)](https://www.npmjs.com/package/@runox/ui)
[![License](https://img.shields.io/npm/l/@runox/ui.svg?style=flat-square)](https://github.com/101yogeshsharma/runox-ui/blob/main/LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@runox/ui.svg?style=flat-square)](https://bundlephobia.com/package/@runox/ui)

The official standalone component library and design system for Runox. It provides a set of highly polished, interactive React components with a modern, glassmorphism-heavy aesthetic.

## Features

- **Comprehensive Design System**: Includes a comprehensive set of design tokens (Colors, Typography, Shadows, Motion) tailored for a sleek dark mode aesthetic.
- **Glassmorphism**: Components natively support translucent layers, blurred backgrounds, and subtle glow borders.
- **Responsive Layout Primitives**: Build complex layouts effortlessly using our token-aware `<Grid>`, `<Flex>`, and `<Stack>` components. No custom CSS required.
- **Micro-interactions**: Includes lightweight CSS and React motion primitives for transitions, reveals, and interactive states without requiring a separate animation runtime.
- **Explicit CSS**: Import the bundled stylesheet once from your application entry point so tokens and component styles are available to root and subpath imports.
- **Fully Typed**: 100% TypeScript with detailed prop interfaces.

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
    <Card variant="glass" isInteractive>
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

### Layout & Typography

- `Text`, `Grid`, `Flex`, `Stack`, `Container`, `Spacer`, `Show`

### Base UI

- `Button`, `Input`, `Card`

### Advanced Interactive

- `Modal`, `Dropdown`, `Tabs`

### Data Display

- `Avatar`, `Badge`, `Table`

The package also exposes navigation, disclosure, overlay, feedback, data-entry, media, motion, and specialized components from the root entry. Stable component subpaths are available for the entries listed in `package.json`.

## Documentation

The documentation and interactive examples for this component library are maintained in the [runox-docs](https://github.com/101yogeshsharma/runox-docs) repository.

For detailed component APIs, usage examples, and design system guidelines, please visit our official documentation site.

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
