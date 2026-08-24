const fs = require("node:fs");
const path = require("node:path");

console.log("Verifying packed package structure...");
try {
  const rootDir = path.join(__dirname, "..");
  const pkgPath = path.join(rootDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  const essentialFiles = [
    "dist/index.js",
    "dist/index.mjs",
    "dist/index.d.ts",
    "package.json",
  ];

  for (const file of essentialFiles) {
    const fullPath = path.join(rootDir, file);
    if (!fs.existsSync(fullPath)) {
      console.error(`[Package Error] Essential file missing: ${file}`);
      process.exit(1);
    }
    const stat = fs.statSync(fullPath);
    if (stat.size === 0) {
      console.error(`[Package Error] File is empty: ${file}`);
      process.exit(1);
    }
  }

  console.log(
    `Package packing verification passed (${pkg.name}@${pkg.version}).`,
  );
} catch (err) {
  console.error("Failed to verify package structure:", err.message);
  process.exit(1);
}
