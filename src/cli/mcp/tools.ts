import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { searchComponents, getComponent, getMcpRegistryData } from "./data";

const COMPONENT_CATEGORIES: Record<string, string> = {
  box: "Primitives",
  text: "Primitives",
  flex: "Primitives",
  grid: "Primitives",
  container: "Primitives",
  button: "Forms",
  input: "Forms",
  textarea: "Forms",
  numberinput: "Forms",
  passwordinput: "Forms",
  otpinput: "Forms",
  taginput: "Forms",
  checkbox: "Forms",
  radio: "Forms",
  radiogroup: "Forms",
  switch: "Forms",
  slider: "Forms",
  rating: "Forms",
  colorpicker: "Forms",
  select: "Forms",
  dropdown: "Forms",
  form: "Forms",
  fileuploader: "Forms",
  signaturepad: "Forms",
  label: "Forms",
  table: "Data Display",
  chart: "Data Display",
  kanban: "Data Display",
  kanbanboard: "Data Display",
  sortablelist: "Data Display",
  virtuallist: "Data Display",
  list: "Data Display",
  treeview: "Data Display",
  timeline: "Data Display",
  progress: "Data Display",
  avatar: "Data Display",
  badge: "Data Display",
  card: "Data Display",
  bentogrid: "Data Display",
  masonrygrid: "Data Display",
  image: "Data Display",
  imagecropper: "Data Display",
  markdownviewer: "Data Display",
  syntaxhighlighter: "Data Display",
  alert: "Feedback",
  alertdialog: "Feedback",
  toast: "Feedback",
  spinner: "Feedback",
  skeleton: "Feedback",
  errorboundary: "Feedback",
  tabs: "Navigation",
  breadcrumb: "Navigation",
  pagination: "Navigation",
  stepper: "Navigation",
  navigationmenu: "Navigation",
  sidebar: "Navigation",
  modal: "Overlays",
  drawer: "Overlays",
  tooltip: "Overlays",
  popover: "Overlays",
  hovercard: "Overlays",
  contextmenu: "Overlays",
  command: "Overlays",
  accordion: "Overlays",
  separator: "Layout",
  scrollarea: "Layout",
  resizable: "Layout",
  carousel: "Layout",
  calendar: "Layout",
  glassfilters: "Layout",
  ai: "AI Components",
  themeprovider: "System",
  runoxprovider: "System",
  motion: "System",
};

export function registerTools(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "search_components",
        description:
          "Search for a Runox UI component by name. Returns matching components with descriptions and variants.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Component name or keyword to search for.",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_component_api",
        description:
          "Get full API for a Runox UI component: props, variants, sizes, colors, and sub-components.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Lowercase component name, e.g. button or modal.",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "get_component_example",
        description: "Get JSX code examples for a Runox UI component.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description:
                "Lowercase component name, e.g. button or accordion.",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "list_all_components",
        description: "List all Runox UI components grouped by category.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "check_import",
        description:
          "Returns the correct import statement. Handles compound dot-notation components correctly.",
        inputSchema: {
          type: "object",
          properties: {
            component: {
              type: "string",
              description:
                "Component name, including dot notation for compound components.",
            },
          },
          required: ["component"],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case "search_components": {
        const query = String(request.params.arguments?.query);
        const results = searchComponents(query);
        if (results.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No components found matching "${query}". Use list_all_components to browse all.`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                results.map((r: any) => ({
                  name: r.name,
                  description: r.description ?? "(no description)",
                  category:
                    COMPONENT_CATEGORIES[r.name?.toLowerCase()] ?? "Other",
                  variants:
                    r.variants?.map((v: any) => v.title ?? v.name) ?? [],
                })),
                null,
                2,
              ),
            },
          ],
        };
      }

      case "get_component_api": {
        const name = String(request.params.arguments?.name).toLowerCase();
        const comp = getComponent(name);
        if (!comp) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Component "${name}" not found. Use list_all_components or search_components to find valid names.`,
          );
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  name: comp.name,
                  description: comp.description ?? "",
                  import:
                    comp.import ?? `import { ${comp.name} } from "@runox/ui";`,
                  propsTable: comp.propsTable ?? [],
                  subComponents: comp.subComponents ?? [],
                  variants: (comp.variants ?? []).map((v: any) => ({
                    title: v.title ?? v.name,
                    code: v.code,
                  })),
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "get_component_example": {
        const name = String(request.params.arguments?.name).toLowerCase();
        const comp = getComponent(name);
        if (!comp) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Component "${name}" not found. Use list_all_components or search_components to find valid names.`,
          );
        }
        const variants = comp.variants ?? [];
        if (variants.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No code examples available for ${comp.name}.`,
              },
            ],
          };
        }
        // Bug 3 fix: use v.title ?? v.name (not just v.name)
        const examples = variants.map(
          (v: any) => `// ${v.title ?? v.name}\n${v.code}`,
        );
        return { content: [{ type: "text", text: examples.join("\n\n") }] };
      }

      case "list_all_components": {
        const data = getMcpRegistryData();
        if (!data)
          throw new McpError(
            ErrorCode.InternalError,
            "Failed to load component registry.",
          );
        // Bug 4 fix: group by category instead of flat comma-string
        const groups: Record<string, { name: string; description: string }[]> =
          {};
        for (const [key, comp] of Object.entries(data)) {
          const cat = COMPONENT_CATEGORIES[key.toLowerCase()] ?? "Other";
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push({
            name: (comp as any).name ?? key,
            description: (comp as any).description ?? "",
          });
        }
        for (const cat of Object.keys(groups)) {
          groups[cat].sort((a, b) => a.name.localeCompare(b.name));
        }
        return {
          content: [{ type: "text", text: JSON.stringify(groups, null, 2) }],
        };
      }

      case "check_import": {
        const raw = String(request.params.arguments?.component);
        // Bug 5 fix: strip .Member suffix for compound components
        const importName = raw.includes(".") ? raw.split(".")[0] : raw;
        return {
          content: [
            {
              type: "text",
              text: `import { ${importName} } from "@runox/ui";`,
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`,
        );
    }
  });
}
