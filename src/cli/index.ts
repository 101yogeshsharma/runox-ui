#!/usr/bin/env node

import { Command } from "commander";
import prompts from "prompts";
import fs from "node:fs";
import path from "node:path";

// Basic CLI Setup
const program = new Command();
const PKG_JSON = require("../../package.json");

program
  .name("runox")
  .description("Runox UI CLI for installing components")
  .version(PKG_JSON.version);

// The registry URL. Ideally, this points to unpkg or jsdelivr.
// Overridable via --registry for local development / private mirrors.
const REGISTRY_URL = `https://unpkg.com/@runox/ui@${PKG_JSON.version}/dist/registry.json`;
const SOURCE_BASE_URL = `https://unpkg.com/@runox/ui@${PKG_JSON.version}/`;

interface RegistryItem {
  name: string;
  type: string;
  registryDependencies: string[];
  files: string[];
}

type Registry = Record<string, RegistryItem>;

async function httpGet(url: string, timeoutMs = 30_000): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) {
    throw new Error(
      `Request to ${url} failed with status ${res.status} ${res.statusText}`,
    );
  }
  return res.text();
}

async function fetchRegistry(registryUrl?: string): Promise<Registry> {
  const data = await httpGet(registryUrl ?? REGISTRY_URL);
  return JSON.parse(data);
}

function getSourceBaseUrl(registryUrl?: string): string {
  if (!registryUrl) return SOURCE_BASE_URL;
  try {
    const u = new URL(registryUrl);
    u.search = "";
    u.hash = "";
    u.pathname = u.pathname.replace(/[^/]*$/, "");
    return u.toString();
  } catch {
    return registryUrl.replace(/[^/]*\.json$/, "").replace(/\/?$/, "/");
  }
}

async function fetchFile(
  filePath: string,
  sourceBaseUrl?: string,
): Promise<string> {
  return httpGet(`${sourceBaseUrl ?? SOURCE_BASE_URL}${filePath}`);
}

// Function to resolve dependencies recursively
function resolveDependencies(
  components: string[],
  registry: Registry,
  resolved = new Set<string>(),
): string[] {
  components.forEach((comp) => {
    if (!registry[comp]) {
      console.warn(`Warning: Component ${comp} not found in registry.`);
      return;
    }
    if (!resolved.has(comp)) {
      resolved.add(comp);
      resolveDependencies(
        registry[comp].registryDependencies || [],
        registry,
        resolved,
      );
    }
  });
  return Array.from(resolved);
}

async function selectComponents(
  components: string[] | undefined,
  registry: Registry,
): Promise<string[]> {
  if (components && components.length > 0) return components;
  const response = await prompts({
    type: "multiselect",
    name: "components",
    message: "Which components would you like to add?",
    choices: Object.values(registry).map((c: any) => ({
      title: c.name,
      value: c.name,
    })),
  });
  return response.components || [];
}

async function writeComponentFile(
  file: string,
  targetDir: string,
  options: { dryRun?: boolean; yes?: boolean; sourceBaseUrl?: string },
): Promise<void> {
  const relativeFilePath = file
    .replace(/^src\/components\//, "")
    .replace(/^src\//, "");
  const finalPath = path.join(targetDir, relativeFilePath);
  const resolved = path.resolve(finalPath);
  const resolvedTarget = path.resolve(targetDir);
  if (
    resolved !== resolvedTarget &&
    !resolved.startsWith(resolvedTarget + path.sep)
  ) {
    throw new Error(`Refusing to write outside target directory: ${file}`);
  }

  if (options.dryRun) {
    console.log(`[DRY RUN] Would write: ${finalPath}`);
    return;
  }

  console.log(`Fetching ${file}...`);
  const content = await fetchFile(file, options.sourceBaseUrl);

  if (fs.existsSync(finalPath) && !options.yes) {
    const { overwrite } = await prompts({
      type: "confirm",
      name: "overwrite",
      message: `File ${finalPath} already exists. Overwrite?`,
      initial: false,
    });
    if (!overwrite) {
      console.log(`Skipped ${finalPath}`);
      return;
    }
  }

  fs.mkdirSync(path.dirname(finalPath), { recursive: true });
  fs.writeFileSync(finalPath, content, "utf8");
  console.log(`Written ${finalPath}`);
}

program
  .command("add [components...]")
  .description("Add components to your project")
  .option("-y, --yes", "Skip confirmation prompt")
  .option("-d, --dry-run", "Preview changes without modifying files")
  .option(
    "-p, --path <path>",
    "Path to add components to",
    "src/components/runox",
  )
  .option(
    "-r, --registry <url>",
    "Base URL of a custom registry (e.g. a local dist for development). Files are fetched from <url>/<file-path>.",
  )
  .action(async (components: string[], options: any) => {
    console.log("Fetching registry...");
    let registry: Registry;
    try {
      registry = await fetchRegistry(options.registry);
    } catch (e: any) {
      console.error(
        "Failed to fetch registry. Are you offline or is the version unpublished?",
        e.message,
      );
      process.exit(1);
    }

    const targetComponents = await selectComponents(components, registry);
    if (!targetComponents.length) process.exit(0);

    const resolvedDeps = resolveDependencies(targetComponents, registry);
    console.log(
      `\nResolving dependencies... Found ${resolvedDeps.length} components to install:`,
    );
    resolvedDeps.forEach((d) => console.log(`- ${d}`));

    if (!options.yes && !options.dryRun) {
      const { confirm } = await prompts({
        type: "confirm",
        name: "confirm",
        message: "Proceed with installation?",
        initial: true,
      });
      if (!confirm) process.exit(0);
    }

    const targetDir = path.resolve(process.cwd(), options.path);
    const sourceBaseUrl = getSourceBaseUrl(options.registry);
    const writeOptions = { ...options, sourceBaseUrl };

    for (const compName of resolvedDeps) {
      const comp = registry[compName];
      if (!comp) continue;

      for (const file of comp.files) {
        await writeComponentFile(file, targetDir, writeOptions);
      }
    }

    console.log("\nDone!");
  });

program
  .command("mcp")
  .description(
    "Start the Runox UI Model Context Protocol (MCP) server for AI assistants",
  )
  .action(async () => {
    const { runMcpServer } = await import("./mcp");
    await runMcpServer();
  });

program.parse(process.argv);
