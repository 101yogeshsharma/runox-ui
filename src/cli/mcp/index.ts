import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools";
import { registerResources } from "./resources";

export async function runMcpServer() {
  const server = new Server(
    {
      name: "runox-ui-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  registerTools(server);
  registerResources(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Important: Because this is an MCP server communicating over stdio,
  // we must not use console.log or it will break the protocol.
  // console.error is safe for logging since it writes to stderr.
  console.error("Runox UI MCP Server running on stdio");
}
