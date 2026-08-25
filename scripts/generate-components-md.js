// Generates COMPONENTS.md from scripts/entry-manifest.json + dist/registry.json.
//
// The generated table lists every public component: name, dot-notation
// namespace members (parsed from the entry source), subpath import, and
// registry dependencies. Regenerate with:
//
//   node scripts/generate-components-md.js
//
// The file is fully reproducible — do not hand-edit COMPONENTS.md.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const manifest = require(path.join(root, "scripts", "entry-manifest.json"));

const SKIP_ENTRIES = new Set(["index", "cli", "test"]);

function componentDir(entryPath) {
  const parts = entryPath.split("/");
  const ci = parts.indexOf("components");
  if (ci === -1) return null;
  return parts.slice(0, ci + 2).join("/");
}

/**
 * Extracts exported namespace members for a component by scanning its
 * entry file for `Object.assign(X, { Member: ... })` / `X.Member = ...`
 * patterns and explicit named exports.
 */
function extractMembers(entryPath) {
  const full = path.join(root, entryPath);
  if (!fs.existsSync(full)) return [];
  const src = fs.readFileSync(full, "utf8");
  const members = new Set();

  // Object.assign(Foo, { Header: ..., Body: ... })
  for (const m of src.matchAll(
    /Object\.assign\(\s*\w+\s*,\s*\{([\s\S]*?)\}\s*\)/g,
  )) {
    for (const k of m[1].matchAll(/^\s*([A-Z]\w+)\s*[:,]/gm)) {
      members.add(k[1]);
    }
  }
  // Foo.Header = ...
  for (const m of src.matchAll(/^\s*(\w+)\.([A-Z]\w+)\s*=/gm)) {
    members.add(m[2]);
  }
  return [...members].sort();
}

/** One-line description from the first JSDoc block above the export. */
function extractDescription(entryPath) {
  const full = path.join(root, entryPath);
  if (!fs.existsSync(full)) return "";
  const src = fs.readFileSync(full, "utf8");
  // First JSDoc comment in the file that isn't a "use client" directive area
  const m = src.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/);
  return m ? m[1].replace(/\.$/, "") : "";
}

const rows = [];

for (const [name, entry] of Object.entries(manifest)) {
  if (
    SKIP_ENTRIES.has(name) ||
    name.startsWith("codemods/") ||
    !entry.includes("src/components/")
  ) {
    continue;
  }
  const dir = componentDir(entry);
  if (!dir) continue;

  const members = extractMembers(entry);
  const description = extractDescription(entry);
  rows.push({ name, entry, members, description });
}

rows.sort((a, b) => a.name.localeCompare(b.name));

let md = `# Component Inventory

> **Auto-generated** by \`scripts/generate-components-md.js\` — do not edit by hand.
> Regenerate: \`node scripts/generate-components-md.js\`

${rows.length} components. Import from the package root or the listed subpath.

| Component | Namespace members | Subpath | Description |
| --------- | ----------------- | ------- | ----------- |
`;

for (const r of rows) {
  const members = r.members.length
    ? r.members.map((m) => `\`${m}\``).join(" · ")
    : "—";
  const desc = r.description || "—";
  md += `| ${r.name} | ${members} | \`@runox/ui/${r.name}\` | ${desc} |\n`;
}

const outPath = path.join(root, "COMPONENTS.md");
fs.writeFileSync(outPath, md, "utf8");
console.log(`COMPONENTS.md written with ${rows.length} components`);
