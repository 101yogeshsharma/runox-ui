const fs = require("node:fs");
const path = require("node:path");

const pkgPath = path.join(__dirname, "../package.json");
const distDir = path.join(__dirname, "../dist");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
const exportsMap = pkg.exports || {};

let passed = true;

for (const [exportKey, exportVal] of Object.entries(exportsMap)) {
  if (typeof exportVal === "object") {
    for (const [format, filePath] of Object.entries(exportVal)) {
      const targetPath = path.resolve(path.join(__dirname, ".."), filePath);
      if (!fs.existsSync(targetPath)) {
        console.error(
          `[Export Error] Export "${exportKey}" -> "${format}" target file missing: ${filePath}`,
        );
        passed = false;
      }
    }
  } else if (typeof exportVal === "string") {
    const targetPath = path.resolve(path.join(__dirname, ".."), exportVal);
    if (!fs.existsSync(targetPath)) {
      console.error(
        `[Export Error] Export "${exportKey}" target file missing: ${exportVal}`,
      );
      passed = false;
    }
  }
}

if (!passed) {
  console.error("Package exports verification failed.");
  process.exit(1);
}

console.log(
  `Successfully verified ${Object.keys(exportsMap).length} package export paths.`,
);
