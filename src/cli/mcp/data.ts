import fs from "node:fs";
import path from "node:path";

// When bundled as dist/cli.js, __dirname is the 'dist/' folder.
// Both registry.json and mcp-registry.json live at dist/ alongside cli.js.

/** Loads the basic CLI registry (used by `runox add`). */
export function getRegistryData() {
  try {
    const registryPath = path.resolve(__dirname, "registry.json");
    if (!fs.existsSync(registryPath)) {
      return null;
    }
    const data = fs.readFileSync(registryPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading registry data:", error);
    return null;
  }
}

/** Loads the AI-enriched MCP registry (props, variants, descriptions, examples). */
export function getMcpRegistryData() {
  try {
    const mcpRegistryPath = path.resolve(__dirname, "mcp-registry.json");
    if (!fs.existsSync(mcpRegistryPath)) {
      // Graceful degradation: fall back to basic registry
      return getRegistryData();
    }
    const data = fs.readFileSync(mcpRegistryPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading MCP registry data:", error);
    return getRegistryData();
  }
}

export function searchComponents(query: string) {
  const data = getMcpRegistryData();
  if (!data) return [];

  const cleanQuery = query.toLowerCase().trim();
  const results = [];
  for (const [key, info] of Object.entries(data)) {
    const comp = info as any;
    const nameMatch = key.toLowerCase().includes(cleanQuery);
    const titleMatch = comp.name?.toLowerCase().includes(cleanQuery);
    const descMatch = comp.description?.toLowerCase().includes(cleanQuery);
    if (nameMatch || titleMatch || descMatch) {
      results.push(comp);
    }
  }
  return results;
}

export function getComponent(name: string) {
  const data = getMcpRegistryData();
  if (!data) return null;

  const raw = name.trim();
  const normalized = raw.toLowerCase().replace(/[-_\s]/g, "");
  const lower = raw.toLowerCase();

  return data[normalized] || data[lower] || data[raw] || null;
}
