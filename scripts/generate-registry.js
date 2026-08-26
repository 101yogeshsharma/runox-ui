// Generates dist/registry.json for the `runox add` CLI.
//
// The CLI (src/cli/index.ts) fetches this file from unpkg and expects:
//   Record<name, { name, type, registryDependencies: string[], files: string[] }>
// where `files` are package-relative paths fetched via SOURCE_BASE_URL
// (e.g. "src/components/Button/index.ts").
//
// Component-level registry dependencies are declared here explicitly because
// they cannot be derived from imports alone (cross-component composition).
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const manifest = require(path.join(root, "scripts", "entry-manifest.json"));

// Cross-component registry dependencies (component -> components it composes).
// Keep in sync with actual imports in src/components.
const REGISTRY_DEPENDENCIES = {
  ai: ["input"],
  alertdialog: [],
  calendar: ["input", "button"],
  colorpicker: ["popover"],
  command: ["modal"],
  contextmenu: [],
  datatable: ["table", "dropdown", "pagination"],
  datetimepicker: ["calendar", "input"],
  dropdown: ["command"],
  form: ["input", "label", "button"],
  kanban: [],
  modal: [],
  navigationmenu: [],
  passwordinput: ["input", "tooltip"],
  radiogroup: ["radio"],
  select: [],
  sidebar: ["button"],
  table: [],
  toast: [],
  tooltip: [],
};

function componentDir(entryPath) {
  // src/components/<Dir>/... -> src/components/<Dir>
  const parts = entryPath.split("/");
  const ci = parts.indexOf("components");
  if (ci === -1) return null;
  return parts.slice(0, ci + 2).join("/");
}

function collectFiles(dir) {
  const out = [];
  if (!fs.existsSync(path.join(root, dir))) return out;
  for (const name of fs.readdirSync(path.join(root, dir))) {
    const full = path.join(dir, name);
    if (
      fs.statSync(path.join(root, full)).isFile() &&
      /\.(tsx?|css)$/.test(name) &&
      !/\.test\./.test(name)
    ) {
      out.push(full.replace(/\\/g, "/"));
    }
  }
  return out.sort();
}

const registry = {};

for (const [name, entry] of Object.entries(manifest)) {
  // Skip non-component entries — the CLI only installs components.
  if (
    name === "index" ||
    name === "cli" ||
    name.startsWith("codemods/") ||
    !entry.includes("src/components/")
  ) {
    continue;
  }

  const dir = componentDir(entry);
  if (!dir) continue;

  const files = collectFiles(dir);
  if (files.length === 0) continue;

  registry[name] = {
    name,
    type: "component",
    registryDependencies: REGISTRY_DEPENDENCIES[name] || [],
    files,
  };
}

const outPath = path.join(root, "dist", "registry.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(registry, null, 2) + "\n", "utf8");
console.log(
  `registry.json written with ${Object.keys(registry).length} components`,
);
