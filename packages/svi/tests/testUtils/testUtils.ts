import { expect } from "vitest";
import path from "path";
import fs from "fs";

export function getCliPathInDist(): string {
  return path.join(__dirname, "../../dist/bin/cli.js");
}

export function assertCliPathExists(): boolean {
  const cliPath = getCliPathInDist();
  const exists = fs.existsSync(cliPath);
  expect(exists, "Please run 'pnpm build', then run tests again").toBeTruthy();
  return exists;
}

export function convertPathToAbsolute(
  fullOrRelativePath: string,
  cwd: string,
): string {
  const fullPath = path.isAbsolute(fullOrRelativePath)
    ? fullOrRelativePath
    : path.resolve(cwd, fullOrRelativePath);
  return fullPath;
}

export function convertToUnixPath(fullOrRelativePath: string): string {
  let result = fullOrRelativePath.replace(/\\/g, "/");

  // Remove Windows drive letter (C:/ → "")
  result = result.replace(/^[A-Za-z]:/, "");

  // Ensure it starts with "/" if it was absolute
  if (!result.startsWith("/")) {
    result = "/" + result;
  }

  // Normalize duplicate slashes
  result = result.replace(/\/+/g, "/");

  //logger.debug(
  //  `Mock FS: fakeFileSystem.convertToUnixPath: '${fullOrRelativePath}' -> '${result}'`,
  //);

  return result;
}

export function pushProcessEnv(): void {
  (globalThis as any)._savedProcessEnv = { ...process.env };
}

export function popProcessEnv(): void {
  if ((globalThis as any)._savedProcessEnv) {
    process.env = (globalThis as any)._savedProcessEnv;
    delete (globalThis as any)._savedProcessEnv;
  }
}

export function prepareForComparison(str: string | undefined): string {
  return str?.toLowerCase().replace(/\s+/g, "") || "";
}

export function clearMarkdownBackticks(prompt: string): string {
  // Remove ALL occurrences of ```
  const clearedPrompt = prompt.replace(/```/g, "");

  return clearedPrompt;
}
