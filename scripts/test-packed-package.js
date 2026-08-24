const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

console.log("Verifying packed package...");
try {
  const output = execSync("npm pack --dry-run --json", {
    cwd: path.join(__dirname, ".."),
    encoding: "utf-8",
  });
  const data = JSON.parse(output);
  const files = data[0]?.files?.map((f) => f.path) || [];
  console.log(`Packed tarball contains ${files.length} files.`);

  const essentialFiles = [
    "dist/index.js",
    "dist/index.mjs",
    "dist/index.d.ts",
    "package.json",
  ];
  for (const ef of essentialFiles) {
    if (!files.some((f) => f.toLowerCase() === ef.toLowerCase())) {
      console.error(`[Package Error] Essential file missing in tarball: ${ef}`);
      process.exit(1);
    }
  }
  console.log("Package packing verification passed.");
} catch (err) {
  console.error("Failed to test packed package:", err.message);
  process.exit(1);
}
