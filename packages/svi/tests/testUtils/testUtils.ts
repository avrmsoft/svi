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

export function pushProcessEnv(): void {
  (globalThis as any)._savedProcessEnv = { ...process.env };
}

export function popProcessEnv(): void {
  if ((globalThis as any)._savedProcessEnv) {
    process.env = (globalThis as any)._savedProcessEnv;
    delete (globalThis as any)._savedProcessEnv;
  }
}
