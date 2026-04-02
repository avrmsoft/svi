// src\utils\pathResolver.ts
import * as path_module from 'path';
import { Config } from '../config/config';

export function resolvePath(path: string, basePath: string | null = null): string {
  // Case 1: If the 'path' variable is an absolute path, just return it unchanged.
  if (path_module.isAbsolute(path)) {
    return path;
  }

  const config = Config.getInstance();
  // Get project path from config (the result of method dir() of Config class)
  const projectRootPath = config.dir; 

  const PROJECT_ROOT_PREFIX = '@project_root';

  // Case 2: If the 'path' variable starts with @project_root,
  // then replace the @project_root variable with project path from config.
  if (path.startsWith(PROJECT_ROOT_PREFIX)) {
    let relativePathFromRoot = path.substring(PROJECT_ROOT_PREFIX.length);
    // Remove leading directory separators to ensure it's treated as a relative segment
    // when resolved against projectRootPath. This handles cases like "@project_root/src/file.ts"
    // where substring yields "/src/file.ts".
    // We check for both OS-specific separator and forward slash for consistency across platforms.
    while (relativePathFromRoot.startsWith(path_module.sep) || relativePathFromRoot.startsWith('/')) {
      relativePathFromRoot = relativePathFromRoot.substring(1);
    }
    return path_module.resolve(projectRootPath, relativePathFromRoot);
  }

  // Case 3 & 4: If the 'path' variable does not start with @, it is relative.
  if (basePath !== null) {
    // Case 3: basePath parameter is not null, then resolve the path as
    // <path from basePath> plus <path or filename from 'path'>.
    return path_module.resolve(basePath, path);
  } else {
    // Case 4: basePath parameter is null, then resolve the path relative to project path from config.
    return path_module.resolve(projectRootPath, path);
  }
}