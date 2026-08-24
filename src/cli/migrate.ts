import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

interface MigrateOptions {
  from: string;
  path: string;
  dry: boolean;
}

export function runMigrate(options: MigrateOptions) {
  const supportedLibraries = ["mui", "chakra", "shadcn"];
  if (!supportedLibraries.includes(options.from)) {
    console.error(
      `Error: Unsupported library "${options.from}". Supported libraries: ${supportedLibraries.join(", ")}`,
    );
    process.exit(1);
  }

  const targetPath = path.resolve(process.cwd(), options.path);
  if (!fs.existsSync(targetPath)) {
    console.error(`Error: Target path "${targetPath}" does not exist.`);
    process.exit(1);
  }

  // The transform file will be bundled in dist/codemods/mui.js etc.
  // When running via `npx @runox/ui migrate`, __dirname is `dist/cli`
  const transformPath = path.resolve(
    __dirname,
    "codemods",
    `${options.from}.js`,
  );

  if (!fs.existsSync(transformPath)) {
    console.error(
      `Error: Transform file not found at ${transformPath}. This might be a bug in the CLI build.`,
    );
    process.exit(1);
  }

  console.log(`Starting migration from ${options.from} to @runox/ui...`);
  console.log(`Target directory: ${targetPath}`);

  // jscodeshift args
  const args = [
    "-t",
    transformPath,
    targetPath,
    "--extensions=tsx,ts,jsx,js",
    "--parser=tsx",
    "--ignore-pattern=**/node_modules/**",
  ];

  if (options.dry) {
    args.push("--dry");
    args.push("--print");
  }

  const isWindows = process.platform === "win32";
  const binName = isWindows ? "jscodeshift.cmd" : "jscodeshift";
  const jscodeshiftBin = path.resolve(
    __dirname,
    "../../node_modules/.bin",
    binName,
  );
  const binPath = fs.existsSync(jscodeshiftBin)
    ? jscodeshiftBin
    : path.resolve(process.cwd(), "node_modules/.bin", binName);

  const child = spawn(binPath, args, {
    stdio: "inherit",
    shell: isWindows,
  });

  child.on("error", (err) => {
    console.error("Failed to start jscodeshift. Is it installed?");
    console.error(err);
    process.exit(1);
  });

  child.on("exit", (code) => {
    if (code === 0) {
      console.log("\nMigration completed successfully!");
      console.log(
        "Note: Please review the files for any 'TODO: unsupported prop' comments.",
      );
    } else {
      console.error(`\njscodeshift exited with code ${code}`);
    }
  });
}
