const fs = require("node:fs");
const path = require("node:path");

const componentsDir = path.join(__dirname, "../src/components");

function checkCSSFiles(dir) {
  let passed = true;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!checkCSSFiles(fullPath)) passed = false;
    } else if (entry.name.endsWith(".css")) {
      const content = fs.readFileSync(fullPath, "utf-8");
      let openBraces = 0;
      for (const ch of content) {
        if (ch === "{") openBraces++;
        if (ch === "}") openBraces--;
      }
      if (openBraces !== 0) {
        console.error(
          `[Style Convention Error] Unbalanced braces in ${fullPath}`,
        );
        passed = false;
      }
    }
  }
  return passed;
}

console.log("Checking style conventions...");
if (!checkCSSFiles(componentsDir)) {
  console.error("Style convention check failed.");
  process.exit(1);
}
console.log("Style conventions check passed.");
