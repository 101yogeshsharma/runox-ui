import { defineConfig } from "tsup";
import entryManifest from "./scripts/entry-manifest.json";

export default defineConfig({
  entry: entryManifest,
  format: ["cjs", "esm"],
  dts: false,
  splitting: true,
  treeshake: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "@hookform/resolvers",
    "@radix-ui/react-slot",
    "cmdk",
    "lucide-react",
    "prism-react-renderer",
    "react-easy-crop",
    "react-hook-form",
    "recharts",
    "zod",
  ],
  minify: true,
  injectStyle: false,
  esbuildPlugins: [],
  esbuildOptions(options) {
    options.conditions = [...(options.conditions || []), "style"];
  },
});
