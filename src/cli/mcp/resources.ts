import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { getRegistryData } from "./data";

export function registerResources(server: Server) {
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: "runox://components",
          name: "Runox UI Component Registry",
          mimeType: "application/json",
          description:
            "The complete registry of all Runox UI components with file listings.",
        },
        {
          uri: "runox://getting-started",
          name: "Getting Started Guide",
          mimeType: "text/markdown",
          description:
            "Installation, setup, and first-component instructions for Runox UI.",
        },
        {
          uri: "runox://theming",
          name: "Theming Guide",
          mimeType: "text/markdown",
          description:
            "Complete guide to Runox UI token-based theming, dark mode, and custom themes.",
        },
      ],
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    switch (request.params.uri) {
      case "runox://components": {
        const data = getRegistryData();
        if (!data)
          throw new McpError(
            ErrorCode.InternalError,
            "Registry data not found",
          );
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: "application/json",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "runox://getting-started": {
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: "text/markdown",
              // Bug 7 fix: include the CSS import step (critical — omitting it results in completely unstyled components)
              text: `# Getting Started with Runox UI

Runox UI is a fully-typed, AI-native React component library with 70+ glassmorphic components.

## 1. Installation

\`\`\`bash
npm install @runox/ui
\`\`\`

## 2. Import Global Styles (Required)

Add the Runox UI stylesheet to your global CSS file (e.g. \`globals.css\` or \`app/globals.css\`):

\`\`\`css
@import "@runox/ui/styles.css";
\`\`\`

Or in your root layout/entry file:
\`\`\`tsx
import "@runox/ui/styles.css";
\`\`\`

Without this import, all components will render completely unstyled.

## 3. Wrap Your App in RunoxProvider

\`\`\`tsx
import { RunoxProvider } from "@runox/ui";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <RunoxProvider>{children}</RunoxProvider>
      </body>
    </html>
  );
}
\`\`\`

\`RunoxProvider\` sets up the theme system, toast notifications, and motion utilities all at once.

## 4. Use Components

\`\`\`tsx
import { Button, Badge, Card } from "@runox/ui";

export default function App() {
  return (
    <Card variant="glass">
      <Card.Header>
        <Badge variant="solid" color="primary">New</Badge>
      </Card.Header>
      <Card.Body>
        <Button variant="solid" color="primary">Get Started</Button>
      </Card.Body>
    </Card>
  );
}
\`\`\`

## 5. TypeScript

Runox UI is fully typed — all component props, variants, and sizes are typed with string literal unions.
No extra \`@types\` packages required.
`,
            },
          ],
        };
      }

      case "runox://theming": {
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: "text/markdown",
              // Bug 6 fix: use actual RunoxTheme interface fields instead of fictional colors.primary
              text: `# Theming with Runox UI

Runox UI uses a CSS variable-based token system. The \`RunoxProvider\` (or \`ThemeProvider\`) handles injection automatically.

## RunoxTheme Token Reference

Pass a \`tokens\` object to \`RunoxProvider\` to customise the design system:

\`\`\`tsx
import { RunoxProvider } from "@runox/ui";

<RunoxProvider tokens={{
  primaryColor: "#7c3aed",
  radius: "md",
  shadowIntensity: "md",
  glassBlurIntensity: "md",
}}>
  <App />
</RunoxProvider>
\`\`\`

### Available Tokens

| Token | Type | Default | Description |
|-------|------|---------|-------------|
| \`primaryColor\` | \`string\` | \`"violet"\` | Primary brand color. Accepts hex, hsl, or Tailwind color names |
| \`radius\` | \`"none" | "sm" | "md" | "lg" | "full"\` | \`"md"\` | Global border-radius scale |
| \`shadowIntensity\` | \`"none" | "sm" | "md" | "lg"\` | \`"md"\` | Global shadow depth |
| \`glassBlurIntensity\` | \`"none" | "sm" | "md" | "lg"\` | \`"md"\` | Glass effect blur strength |

## Dark Mode

\`RunoxProvider\` / \`ThemeProvider\` support three theme modes:

\`\`\`tsx
// System preference (recommended)
<RunoxProvider defaultTheme="system">

// Always dark
<RunoxProvider defaultTheme="dark">

// Always light
<RunoxProvider defaultTheme="light">
\`\`\`

## ThemeProvider (standalone)

For advanced cases where you only need theming without toast or motion:

\`\`\`tsx
import { ThemeProvider } from "@runox/ui";

<ThemeProvider
  defaultTheme="system"
  tokens={{ primaryColor: "#10b981", radius: "lg" }}
>
  <App />
</ThemeProvider>
\`\`\`

## Density / Layout Scale

\`\`\`tsx
<RunoxProvider defaultConfig={{ density: "compact" }}>
  // density: "compact" | "normal" | "comfortable"
\`\`\`
`,
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Unknown resource URI: ${request.params.uri}`,
        );
    }
  });
}
