// src/utils/pathResolver.ts
import path from "path";
import { Config } from "../config/config"; // Relative path from src/utils/ to src/config/

export function resolvePath(p: string, basePath: string | null = null): string {
  // Case 1: If the 'path' variable is an absolute path, just return it unchanged.
  if (path.isAbsolute(p)) {
    return p;
  }

  const projectRoot = Config.getInstance().dir;

  // Case 2: If the 'path' variable starts with @project_root, then replace the
  // @project_root variable with project path from config
  if (p.startsWith("@project_root")) {
    let relativePath = p.substring("@project_root".length);
    if (relativePath.startsWith("/") || relativePath.startsWith("\\")) {
      relativePath = relativePath.substring(1);
    }
    return path.resolve(projectRoot, relativePath);
  }
  // If the 'path' variable does not start with @
  else if (!p.startsWith("@")) {
    // Case 3: If 'basePath' parameter is not null, then resolve the path as
    // <path from basePath> plus <path or filename from 'path'>
    if (basePath !== null) {
      return path.resolve(basePath, p);
    }
    // Case 4: If 'basePath' parameter is null, then resolve the path relative
    // to project path from config
    else {
      // basePath === null
      return path.resolve(projectRoot, p);
    }
  }
  // This 'else' block handles paths that are not absolute,
  // do not start with '@project_root', but *do* start with '@'
  // (e.g., "@some_other_prefix/file.txt").
  // This specific scenario is not explicitly defined in the problem specification's cases.
  // To ensure the function always returns a string and fulfills the general
  // purpose of "turn relative path to absolute", the most robust fallback
  // is to resolve it against the project root. This treats any unhandled
  // '@' prefix as a literal part of a path segment relative to the project root.
  else {
    return path.resolve(projectRoot, p);
  }
}
