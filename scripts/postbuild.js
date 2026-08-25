const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const entries = require(path.join(__dirname, "entry-manifest.json"));

const clientEntries = Object.keys(entries).filter(
  (name) => name !== "cli" && !name.startsWith("codemods/"),
);

clientEntries
  .flatMap((name) => [`dist/${name}.mjs`, `dist/${name}.js`])
  .forEach((file) => {
    const filePath = path.join(__dirname, "..", file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      if (!content.startsWith('"use client";')) {
        fs.writeFileSync(filePath, '"use client";\n' + content);
      }
    }
  });

// Process CSS with Tailwind
const distDir = path.join(__dirname, "..", "dist");
const cssFile = path.join(distDir, "index.css");
const tmpCssFile = path.join(distDir, "index.tmp.css");

if (fs.existsSync(cssFile)) {
  console.log("Processing CSS with Tailwind v4...");

  // Combine all CSS files in dist into index.tmp.css
  let combinedCss = `@source "../src";\n` + fs.readFileSync(cssFile, "utf8");
  const distFiles = fs.readdirSync(distDir);
  distFiles.forEach((file) => {
    if (
      file.endsWith(".css") &&
      file !== "index.css" &&
      file !== "index.tmp.css"
    ) {
      combinedCss += "\n" + fs.readFileSync(path.join(distDir, file), "utf8");
    }
  });

  fs.writeFileSync(tmpCssFile, combinedCss);

  try {
    execSync(
      `npx tailwindcss -i dist/index.tmp.css -o dist/index.css --minify`,
      {
        cwd: path.join(__dirname, ".."),
        stdio: "inherit",
      },
    );
  } finally {
    if (fs.existsSync(tmpCssFile)) {
      fs.unlinkSync(tmpCssFile);
    }
  }
  console.log("Tailwind CSS processing complete.");
}

// Generate registry.json for the `runox add` CLI
console.log("Generating component registry...");
execSync(`node ${path.join(__dirname, "generate-registry.js")}`, {
  cwd: path.join(__dirname, ".."),
  stdio: "inherit",
});
