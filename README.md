# @runox/ui

The official standalone component library and design system for Runox. It provides a set of highly polished, interactive React components with a premium, glassmorphism-heavy aesthetic.

## 🚀 Features

- **Premium Design System**: Includes a comprehensive set of design tokens (Colors, Typography, Shadows, Motion) tailored for a premium dark mode aesthetic.
- **Glassmorphism**: Components natively support translucent layers, blurred backgrounds, and subtle glow borders.
- **Responsive Layout Primitives**: Build complex layouts effortlessly using our token-aware `<Grid>`, `<Flex>`, and `<Stack>` components. No custom CSS required.
- **Micro-interactions**: Uses `framer-motion` to power buttery-smooth micro-animations on interactive elements (e.g., Spring-animated Modals, Magic layout Tabs, Hover elevation Cards).
- **Zero Config CSS**: CSS is seamlessly bundled directly into the JS bundle via `tsup`, meaning no additional CSS imports are necessary in the consuming application!
- **Fully Typed**: 100% TypeScript with detailed prop interfaces.

## 📦 Installation

```bash
npm install @runox/ui
```

### Peer Dependencies

Make sure you have the following peer dependencies installed in your project:

```bash
npm install react react-dom framer-motion
```

## 🛠 Usage

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
        <Text variant="h3">Premium Experience</Text>
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

## 📚 Components

### Layout & Typography

- `Text`, `Grid`, `Flex`, `Stack`, `Container`, `Spacer`, `Show`

### Base UI

- `Button`, `Input`, `Card`

### Advanced Interactive

- `Modal`, `Dropdown`, `Tabs`

### Data Display

- `Avatar`, `Badge`, `Table`

## 📚 Documentation

The documentation and interactive examples for this component library are maintained in a separate repository. Please refer to that repository for detailed component APIs, usage examples, and design system guidelines.

## 👨‍💻 Development

### Commands

- `npm run build` - Builds the package using `tsup`.
- `npm run test` - Runs the Vitest test suite.
