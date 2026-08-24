const fs = require("node:fs");
const path = require("node:path");

const entries = require(path.join(__dirname, "entry-manifest.json"));

const distDir = path.join(__dirname, "../dist");

for (const [name, srcPath] of Object.entries(entries)) {
  if (name === "index" || name === "cli") continue;

  const relativePath = srcPath.replace(/^src\//, "./").replace(/\.tsx?$/, "");

  const dtsContent = `export * from "${relativePath}";\n`;
  const dtsFilePath = path.join(distDir, `${name}.d.ts`);

  fs.writeFileSync(dtsFilePath, dtsContent);
}

console.log("Types re-exported successfully.");
