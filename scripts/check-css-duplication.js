// CI guard: fails if a rnx-<component> selector is defined in BOTH globals.css
// and its own component CSS file (excluding reduced-motion override blocks).
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const globalsPath = path.join(root, "src", "styles", "globals.css");

function stripOverrides(css) {
  // Remove prefers-reduced-motion blocks — they legitimately reference component classes.
  return css.replace(
    /@media \(prefers-reduced-motion[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g,
    "",
  );
}

function extractSelectors(css) {
  const set = new Set();
  const re = /\.((?:rnx-[a-z0-9-]+))(?![\w-])/g;
  let m;
  while ((m = re.exec(css))) set.add(m[1]);
  return set;
}

const globals = stripOverrides(fs.readFileSync(globalsPath, "utf8"));
const globalSelectors = extractSelectors(globals);

const componentsDir = path.join(root, "src", "components");
let conflicts = 0;

for (const dir of fs.readdirSync(componentsDir)) {
  const cssFile = path.join(componentsDir, dir, `${dir}.css`);
  if (!fs.existsSync(cssFile)) continue;
  const compSelectors = extractSelectors(
    stripOverrides(fs.readFileSync(cssFile, "utf8")),
  );
  for (const sel of compSelectors) {
    if (globalSelectors.has(sel)) {
      conflicts++;
      console.error(
        `DUPLICATE: .${sel} defined in both globals.css and ${dir}/${dir}.css`,
      );
    }
  }
}

if (conflicts > 0) {
  console.error(
    `\n${conflicts} duplicate selector(s) found. Remove the legacy copy from globals.css.`,
  );
  process.exit(1);
}
console.log("No CSS duplication between globals.css and component styles ✓");
