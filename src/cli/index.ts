#!/usr/bin/env node

import { Command } from "commander";
import prompts from "prompts";
import fs from "fs";
import path from "path";
import https from "https";
import { runMigrate } from "./migrate";
import { runMcpServer } from "./mcp";

// Basic CLI Setup
const program = new Command();
const PKG_JSON = require("../../package.json");

program
  .name("runox")
  .description("Runox UI CLI for installing components")
  .version(PKG_JSON.version);

// The registry URL. Ideally, this points to unpkg or jsdelivr
const REGISTRY_URL = `https://unpkg.com/@runox/ui@${PKG_JSON.version}/dist/registry.json`;
const SOURCE_BASE_URL = `https://unpkg.com/@runox/ui@${PKG_JSON.version}/`;

interface RegistryItem {
  name: string;
  type: string;
  registryDependencies: string[];
  files: string[];
}

type Registry = Record<string, RegistryItem>;

async function fetchRegistry(): Promise<Registry> {
  return new Promise((resolve, reject) => {
    https.get(REGISTRY_URL, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

async function fetchFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(`${SOURCE_BASE_URL}${filePath}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

// Function to resolve dependencies recursively
function resolveDependencies(components: string[], registry: Registry, resolved = new Set<string>()): string[] {
  components.forEach((comp) => {
    if (!registry[comp]) {
      console.warn(`Warning: Component ${comp} not found in registry.`);
      return;
    }
    if (!resolved.has(comp)) {
      resolved.add(comp);
      resolveDependencies(registry[comp].registryDependencies || [], registry, resolved);
    }
  });
  return Array.from(resolved);
}

program
  .command("add [components...]")
  .description("Add components to your project")
  .option("-y, --yes", "Skip confirmation prompt")
  .option("-d, --dry-run", "Preview changes without modifying files")
  .option("-p, --path <path>", "Path to add components to", "src/components/runox")
  .action(async (components: string[], options: any) => {
    console.log("Fetching registry...");
    let registry: Registry;
    try {
      registry = await fetchRegistry();
    } catch (e: any) {
      console.error("Failed to fetch registry. Are you offline or is the version unpublished?", e.message);
      process.exit(1);
    }

    let targetComponents = components;
    if (!targetComponents || targetComponents.length === 0) {
      const response = await prompts({
        type: "multiselect",
        name: "components",
        message: "Which components would you like to add?",
        choices: Object.values(registry).map((c: any) => ({ title: c.name, value: c.name })),
      });
      targetComponents = response.components;
      if (!targetComponents || targetComponents.length === 0) process.exit(0);
    }

    const resolvedDeps = resolveDependencies(targetComponents, registry);
    
    console.log(`\nResolving dependencies... Found ${resolvedDeps.length} components to install:`);
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

    for (const compName of resolvedDeps) {
      const comp = registry[compName];
      if (!comp) continue;

      for (const file of comp.files) {
        // Use the original dir structure inside src/components/runox
        const relativeFilePath = file.replace(/^src\//, ""); // Removes 'src/' prefix
        const finalPath = path.join(targetDir, relativeFilePath);
        
        if (options.dryRun) {
          console.log(`[DRY RUN] Would write: ${finalPath}`);
          continue;
        }

        console.log(`Fetching ${file}...`);
        const content = await fetchFile(file);
        
        if (fs.existsSync(finalPath) && !options.yes && !options.dryRun) {
          const { overwrite } = await prompts({
            type: "confirm",
            name: "overwrite",
            message: `File ${finalPath} already exists. Overwrite?`,
            initial: false,
          });
          if (!overwrite) {
            console.log(`Skipped ${finalPath}`);
            continue;
          }
        }
        
        fs.mkdirSync(path.dirname(finalPath), { recursive: true });
        fs.writeFileSync(finalPath, content, "utf8");
        console.log(`Written ${finalPath}`);
      }
    }

    console.log("\nDone!");
  });

program
  .command("migrate")
  .description("Migrate from another UI library to Runox UI")
  .requiredOption("--from <library>", "The library you are migrating from (e.g. mui, chakra, shadcn)")
  .option("-p, --path <path>", "Path to the directory containing files to migrate", "src")
  .option("-d, --dry", "Run without modifying files (jscodeshift dry run)", false)
  .action((options: any) => {
    runMigrate(options);
  });

program
  .command("mcp")
  .description("Start the Runox UI Model Context Protocol (MCP) server for AI assistants")
  .action(() => {
    runMcpServer();
  });

program.parse(process.argv);
