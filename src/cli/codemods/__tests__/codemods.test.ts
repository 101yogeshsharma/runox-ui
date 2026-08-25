import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
// jscodeshift's test runner isn't used directly; we invoke transforms via the
// core API so the fixtures run in CI like any other unit test.
import jscodeshift from "jscodeshift";
import shadcnTransform from "../shadcn";
import flatTransform from "../flat";

const fixturesDir = resolve(__dirname, "..", "__fixtures__");

function runTransform(transform: any, inputFile: string): string {
  const source = readFileSync(resolve(fixturesDir, inputFile), "utf8");
  const api = {
    jscodeshift,
    j: jscodeshift,
    stats: () => {},
    report: () => {},
  };
  const result = transform({ path: inputFile, source }, api, {});
  expect(result).toBeTruthy();
  return result as string;
}

describe("shadcn codemod", () => {
  it("converts Card* components to Card dot-notation members", () => {
    const output = runTransform(shadcnTransform, "shadcn.input.tsx");
    const expected = readFileSync(
      resolve(fixturesDir, "shadcn.output.tsx"),
      "utf8",
    );
    // Compare normalized (whitespace-insensitive) since recast formatting
    // may differ slightly from hand-written fixture.
    expect(normalize(output)).toBe(normalize(expected));
  });
});

describe("flat codemod", () => {
  it("migrates flat Modal* names to Modal dot-notation", () => {
    const output = runTransform(flatTransform, "flat.input.tsx");
    const expected = readFileSync(
      resolve(fixturesDir, "flat.output.tsx"),
      "utf8",
    );
    expect(normalize(output)).toBe(normalize(expected));
  });
});

function normalize(src: string): string {
  return src
    .replace(/\/\/.*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
