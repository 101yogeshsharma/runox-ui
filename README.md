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
- **Micro-interactions**: Uses `framer-motion` to power buttery-smooth micro-animations on interactive elements (e.g., Spring-animated Modals, Magic layout Tabs, Hover elevation Cards).
- **Zero Config CSS**: CSS is seamlessly bundled directly into the JS bundle via `tsup`, meaning no additional CSS imports are necessary in the consuming application!
- **Fully Typed**: 100% TypeScript with detailed prop interfaces.

## Installation

```bash
npm install @runox/ui
```

### Peer Dependencies

Make sure you have the following peer dependencies installed in your project:

```bash
npm install react react-dom framer-motion
```

## Usage

### Setup

Simply wrap your application with the global CSS variables and you're good to go. Since CSS is injected automatically, you just use the components!

> Note: Make sure to define any required CSS custom properties in your app's global stylesheet or ensure the `globals.css` from `@runox/ui` is available if it was exported separately. Because we use `injectStyle: true`, the component styles are injected automatically!

### Example

```tsx
import { Button, Card, CardHeader, CardBody, Text } from "@runox/ui";

function App() {
  return (
    <Card variant="glass" isInteractive>
      <CardHeader>
        <Text variant="h3">Modern Experience</Text>
      </CardHeader>
      <CardBody>
        <Text color="secondary">Enjoy our beautiful design system.</Text>
        <Button variant="solid" color="success">
          Get Started
        </Button>
      </CardBody>
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

## Documentation

The documentation and interactive examples for this component library are maintained in the [runox-docs](https://github.com/101yogeshsharma/runox-docs) repository. 

For detailed component APIs, usage examples, and design system guidelines, please visit our official documentation site.

## Development

### Commands

- `npm run build` - Builds the package using `tsup`.
- `npm run test` - Runs the Vitest test suite.
