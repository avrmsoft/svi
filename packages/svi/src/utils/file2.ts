import fs from "fs";
import path from "path";

export function getRelativePath(fileOrFolderFullPath: string, basePath: string): string {
  const relativeToBase = path.relative(basePath, fileOrFolderFullPath);

  // path.relative will return a path that starts with '..' if fileOrFolderFullPath
  // is not a subpath of basePath (i.e., it needs to go up the directory tree).
  // It can also return '.' if the paths are identical.
  // We need to check for '..' specifically, but also consider Windows paths where
  // it might be '..\'.
  const isSubpath = !relativeToBase.startsWith('..') && !relativeToBase.startsWith('./..') && !relativeToBase.startsWith('..\\') && relativeToBase !== '';

  // If relativeToBase is an empty string, it means fileOrFolderFullPath and basePath are identical.
  // In this case, it's a subpath (or identical path).
  if (isSubpath || relativeToBase === '') {
    return relativeToBase;
  } else {
    // If it's not a subpath, return the original full path.
    return fileOrFolderFullPath;
  }
}