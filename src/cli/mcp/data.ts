import fs from "node:fs";
import path from "node:path";

// In production (when installed globally or locally via npm), the registry.json
// will be at dist/registry.json. We can resolve it relative to __dirname.
export function getRegistryData() {
  try {
    const registryPath = path.resolve(__dirname, "../../registry.json");
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

export function searchComponents(query: string) {
  const data = getRegistryData();
  if (!data) return [];

  const results = [];
  for (const [name, info] of Object.entries(data)) {
    if (name.toLowerCase().includes(query.toLowerCase())) {
      results.push(info);
    }
  }
  return results;
}

export function getComponent(name: string) {
  const data = getRegistryData();
  if (!data) return null;
  return data[name] || null;
}
