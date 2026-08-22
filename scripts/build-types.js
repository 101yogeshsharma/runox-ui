const fs = require('fs');
const path = require('path');

const configCode = fs.readFileSync(path.join(__dirname, '../tsup.config.ts'), 'utf8');

// Extremely simple regex to extract the entry object
const entryMatch = configCode.match(/entry:\s*{([^}]+)}/);
if (!entryMatch) {
  console.error("Could not find entry object in tsup.config.ts");
  process.exit(1);
}

const entryString = entryMatch[1];
const entries = {};

// Parse the entries
entryString.split('\n').forEach(line => {
  const match = line.match(/([a-zA-Z0-9_]+):\s*["']([^"']+)["']/);
  if (match) {
    entries[match[1]] = match[2];
  }
});

const distDir = path.join(__dirname, '../dist');

for (const [name, srcPath] of Object.entries(entries)) {
  if (name === 'index' || name === 'cli') continue; // index.d.ts and cli.d.ts are emitted directly at the root if they are in src root

  // Calculate the relative path from dist root to the emitted .d.ts file
  // srcPath is like "src/components/Accordion/index.ts"
  // tsc outputs it to "dist/components/Accordion/index.d.ts"
  // so from dist root, it's "./components/Accordion/index"
  let relativePath = srcPath.replace(/^src\//, './').replace(/\.tsx?$/, '');

  const dtsContent = `export * from "${relativePath}";\n`;
  const dtsFilePath = path.join(distDir, `${name}.d.ts`);
  
  fs.writeFileSync(dtsFilePath, dtsContent);
}

console.log("Types re-exported successfully.");
