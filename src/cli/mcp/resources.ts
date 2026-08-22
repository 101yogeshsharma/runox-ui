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
          name: "Runox UI Registry",
          mimeType: "application/json",
          description: "The complete JSON registry of all Runox UI components.",
        },
        {
          uri: "runox://getting-started",
          name: "Getting Started Guide",
          mimeType: "text/markdown",
          description: "Installation and setup instructions for Runox UI.",
        },
        {
          uri: "runox://theming",
          name: "Theming Guide",
          mimeType: "text/markdown",
          description: "Documentation on Runox UI's zero-config token-based theming system.",
        }
      ],
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    switch (request.params.uri) {
      case "runox://components": {
        const data = getRegistryData();
        if (!data) throw new McpError(ErrorCode.InternalError, "Registry data not found");
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
              text: `# Getting Started with Runox UI

Runox UI is a beautiful, fully-typed React component library.

## Installation

\`\`\`bash
npm install @runox/ui
\`\`\`

## Setup
Wrap your application in the RunoxProvider:

\`\`\`tsx
import { RunoxProvider } from "@runox/ui";

export default function App({ children }) {
  return <RunoxProvider>{children}</RunoxProvider>;
}
\`\`\`

Then use components:
\`\`\`tsx
import { Button } from "@runox/ui";

<Button variant="solid">Hello</Button>
\`\`\``,
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
              text: `# Theming

Runox UI uses a zero-config, CSS-variable-based token system. The \`ThemeProvider\` handles injection.

## Theme Token Structure
- \`colors.primary\`
- \`colors.secondary\`
- \`colors.background\`
- \`colors.foreground\`

## Overriding Tokens
Pass a tokens object to the \`RunoxProvider\`:

\`\`\`tsx
<RunoxProvider tokens={{ colors: { primary: "#ff0000" } }}>
  <App />
</RunoxProvider>
\`\`\``,
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Unknown resource URI: ${request.params.uri}`
        );
    }
  });
}
