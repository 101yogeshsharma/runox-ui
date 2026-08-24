import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { searchComponents, getComponent, getRegistryData } from "./data";

export function registerTools(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "search_components",
          description: "Search for a component in Runox UI by name (e.g. 'button'). Returns basic metadata.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The name of the component to search for.",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "get_component_api",
          description: "Get the API details (props, variants) for a specific component.",
          inputSchema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The exact name of the component (e.g. 'Button').",
              },
            },
            required: ["name"],
          },
        },
        {
          name: "get_component_example",
          description: "Get JSX code examples showing how to use a specific component.",
          inputSchema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The exact name of the component.",
              },
            },
            required: ["name"],
          },
        },
        {
          name: "list_all_components",
          description: "List all available Runox UI components grouped by type.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "check_import",
          description: "Returns the correct import statement for a given component.",
          inputSchema: {
            type: "object",
            properties: {
              component: {
                type: "string",
                description: "The name of the component.",
              },
            },
            required: ["component"],
          },
        }
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case "search_components": {
        const query = String(request.params.arguments?.query);
        const results = searchComponents(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results.map((r: any) => ({ name: r.name, description: r.description })), null, 2),
            },
          ],
        };
      }
      
      case "get_component_api": {
        const name = String(request.params.arguments?.name).toLowerCase();
        const comp = getComponent(name);
        if (!comp) {
          throw new McpError(ErrorCode.InvalidParams, `Component ${name} not found.`);
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                name: comp.name,
                propsTable: comp.propsTable || [],
                variants: comp.variants || [],
              }, null, 2),
            },
          ],
        };
      }

      case "get_component_example": {
        const name = String(request.params.arguments?.name).toLowerCase();
        const comp = getComponent(name);
        if (!comp) {
          throw new McpError(ErrorCode.InvalidParams, `Component ${name} not found.`);
        }
        
        // Find variant examples
        const examples = (comp.variants || []).map((v: any) => `// ${v.name}\n${v.code}`);
        
        return {
          content: [
            {
              type: "text",
              text: examples.length > 0 ? examples.join("\n\n") : "No examples found.",
            },
          ],
        };
      }

      case "list_all_components": {
        const data = getRegistryData();
        if (!data) {
          throw new McpError(ErrorCode.InternalError, "Failed to load registry.");
        }
        const names = Object.keys(data).map(k => data[k].name);
        return {
          content: [
            {
              type: "text",
              text: names.join(", "),
            },
          ],
        };
      }

      case "check_import": {
        const name = String(request.params.arguments?.component);
        return {
          content: [
            {
              type: "text",
              text: `import { ${name} } from "@runox/ui";`,
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
    }
  });
}
