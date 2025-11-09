import path from "path";

export function getCliPath(): string {
  return path.join(__dirname, "../../dist/bin/cli.js");
}

export function convertPathToAbsolute(
  fullOrRelativePath: string,
  cwd: string
): string {
  const fullPath = path.isAbsolute(fullOrRelativePath)
    ? fullOrRelativePath
    : path.resolve(cwd, fullOrRelativePath);
  return fullPath;
}
