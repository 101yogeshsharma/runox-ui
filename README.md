# Runox UI Monorepo

Welcome to the Runox UI monorepo! This repository contains the `@runox/ui` component library and a comprehensive Next.js testbench application used for testing and visual validation.

## 📦 Packages

### 1. `@runox/ui` (Component Library)

The official standalone component library and design system for Runox. It provides a set of highly polished, interactive React components with a premium, glassmorphism-heavy aesthetic.

- **Location**: `packages/ui`
- **Features**: Glassmorphism, Responsive Primitives, Micro-interactions (Framer Motion), Zero Config CSS (bundled), Fully Typed.
- **Build**: `npm run build -w @runox/ui`

### 2. `runox-testbench` (Next.js Application)

A full Next.js 15 application built to test and validate every component in the `@runox/ui` library. It features a dashboard layout with dedicated pages for testing Forms, Layout, Data Display, Overlays, Feedback, and Advanced AI components.

- **Location**: `apps/runox-testbench`
- **Run Locally**: `npm run dev -w runox-testbench`
- **Build**: `npm run build -w runox-testbench`

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- `npm`

### Setup

1. **Install Dependencies**
   From the root of the monorepo, install all dependencies across all workspaces:

   ```bash
   npm install
   ```

2. **Build the Component Library**
   Before running the testbench, ensure the `@runox/ui` library is built:

   ```bash
   npm run build -w @runox/ui
   ```

3. **Start the Testbench App**
   Launch the Next.js development server to view the components in action:
   ```bash
   npm run dev -w runox-testbench
   ```
   Open [http://localhost:3001](http://localhost:3001) in your browser.

## 📚 Documentation

For detailed component APIs, usage examples, and design system guidelines, please refer to our separate documentation repository.

## 🛠 Commands (Root)

- `npm run build` - Builds all packages and apps via Turborepo.
- `npm run dev` - Starts development servers for all apps.
- `npm run lint` - Runs ESLint across all packages and apps.
