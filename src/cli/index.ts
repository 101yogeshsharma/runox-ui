#!/usr/bin/env node

import { Command } from "commander";
import prompts from "prompts";
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
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

function httpGet(url: string, maxRedirects = 5): Promise<string> {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) {
      return reject(new Error(`Too many redirects when requesting ${url}`));
    }
    https
      .get(url, (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume();
          return resolve(
            httpGet(
              new URL(res.headers.location, url).toString(),
              maxRedirects - 1,
            ),
          );
        }
        if (status < 200 || status >= 300) {
          res.resume();
          return reject(
            new Error(`Request to ${url} failed with status ${status}`),
          );
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

async function fetchRegistry(): Promise<Registry> {
  const data = await httpGet(REGISTRY_URL);
  return JSON.parse(data);
}

async function fetchFile(filePath: string): Promise<string> {
  return httpGet(`${SOURCE_BASE_URL}${filePath}`);
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
  options: { dryRun?: boolean; yes?: boolean },
): Promise<void> {
  const relativeFilePath = file.replace(/^src\//, "");
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
  const content = await fetchFile(file);

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
  .action(async (components: string[], options: any) => {
    console.log("Fetching registry...");
    let registry: Registry;
    try {
      registry = await fetchRegistry();
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

    for (const compName of resolvedDeps) {
      const comp = registry[compName];
      if (!comp) continue;

      for (const file of comp.files) {
        await writeComponentFile(file, targetDir, options);
      }
    }

    console.log("\nDone!");
  });

program
  .command("migrate")
  .description("Migrate from another UI library to Runox UI")
  .requiredOption(
    "--from <library>",
    "The library you are migrating from (e.g. mui, chakra, shadcn)",
  )
  .option(
    "-p, --path <path>",
    "Path to the directory containing files to migrate",
    "src",
  )
  .option(
    "-d, --dry",
    "Run without modifying files (jscodeshift dry run)",
    false,
  )
  .action((options: any) => {
    runMigrate(options);
  });

program
  .command("mcp")
  .description(
    "Start the Runox UI Model Context Protocol (MCP) server for AI assistants",
  )
  .action(() => {
    runMcpServer();
  });

program.parse(process.argv);
