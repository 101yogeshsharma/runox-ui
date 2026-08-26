import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools";
import { registerResources } from "./resources";

// Use package.json version so the MCP server version tracks the library version
const { version } = require("../../../package.json") as { version: string };

export async function runMcpServer() {
  const server = new Server(
    {
      name: "runox-ui-mcp",
      version,
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    },
  );

  registerTools(server);
  registerResources(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Important: Because this is an MCP server communicating over stdio,
  // we must not use console.log or it will break the protocol.
  // console.error is safe for logging since it writes to stderr.
  console.error(`Runox UI MCP Server v${version} running on stdio`);
}
