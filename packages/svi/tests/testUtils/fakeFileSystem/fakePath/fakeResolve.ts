export enum PathType {
  None,
  Windows,
  Linux,
}

export interface PathInfo {
  original: string;
  type: PathType;
  separator: '/' | '\\' | undefined; // The separator detected in the original path string
  isAbsolute: boolean;
  driveLetter: string | undefined; // e.g., 'C' or 'D'
}

/**
 * Determines if the current operating system is Windows.
 * For this fake implementation, we assume `process` is available in a Node.js-like environment.
 */
function isWindowsOS(): boolean {
  return typeof process !== 'undefined' && process.platform === 'win32';
}

/**
 * Determines the default path separator for the current operating system.
 */
function determineSystemSeparator(): '/' | '\\' {
  return isWindowsOS() ? '\\' : '/';
}

/**
 * Parses a path string to determine its type, absolute status, and components.
 */
function parsePath(p: string): PathInfo {
  let type: PathType = PathType.None;
  let separator: '/' | '\\' | undefined = undefined;
  let isAbsolute = false;
  let driveLetter: string | undefined = undefined;

  // 1. Check for Windows drive letter absolute path (e.g., C:\folder)
  const winDriveAbsMatch = p.match(/^([a-zA-Z]):[\\\/]/);
  if (winDriveAbsMatch) {
    type = PathType.Windows;
    separator = '\\'; // Windows paths primarily use backslash
    isAbsolute = true;
    driveLetter = winDriveAbsMatch[1].toUpperCase();
  }
  // 2. Check for Windows UNC path absolute (e.g., \\server\share)
  else if (p.startsWith('\\\\') || p.startsWith('//')) {
    type = PathType.Windows;
    separator = '\\'; // UNC paths primarily use backslash
    isAbsolute = true;
  }
  // 3. Check for Linux absolute path (e.g., /folder)
  else if (p.startsWith('/')) {
    type = PathType.Linux;
    separator = '/';
    isAbsolute = true;
  }
  // 4. Check for Windows drive letter only (e.g., C:) - not absolute
  else {
    const winDriveOnlyMatch = p.match(/^([a-zA-Z]):$/);
    if (winDriveOnlyMatch) {
      type = PathType.Windows;
      separator = '\\'; // Implied Windows separator
      isAbsolute = false; // C: is not an absolute path itself
      driveLetter = winDriveOnlyMatch[1].toUpperCase();
    }
    // 5. Check for Windows separator within path
    else if (p.includes('\\')) {
      type = PathType.Windows;
      separator = '\\';
    }
    // 6. Check for Linux separator within path
    else if (p.includes('/')) {
      type = PathType.Linux;
      separator = '/';
    }
  }

  // Ensure separator is set if type is detected but no explicit separator was found yet
  if (type === PathType.Windows && separator === undefined) {
      separator = '\\';
  } else if (type === PathType.Linux && separator === undefined) {
      separator = '/';
  }

  return { original: p, type, separator, isAbsolute, driveLetter };
}

/**
 * Normalizes a path string, resolving '..' and '.', and using a consistent separator.
 * @param inputPath The raw path string to normalize.
 * @param targetSeparator The separator to use for the final normalized path.
 * @param isPathAbsolute A boolean indicating if the final path should be absolute.
 * @param driveLetter An optional drive letter for Windows paths.
 * @returns The normalized path string.
 */
function normalizePath(
  inputPath: string,
  targetSeparator: '/' | '\\',
  isPathAbsolute: boolean,
  driveLetter: string | undefined,
): string {
  let pathWithoutDrive = inputPath;
  let currentDriveLetter = driveLetter;

  // If a drive letter is explicitly passed, ensure it's honored
  // and remove it from the path string for segment processing.
  const driveMatch = inputPath.match(/^([a-zA-Z]):[\\\/]?/);
  if (driveMatch) {
      currentDriveLetter = driveMatch[1].toUpperCase();
      pathWithoutDrive = inputPath.substring(driveMatch[0].length);
  } else if (currentDriveLetter) {
      // If driveLetter was passed but not at the start of inputPath, it applies conceptually.
      // E.g., for D:foo, the path starts with 'D:foo', not 'D:\foo'.
      // No substring removal needed here, pathWithoutDrive remains inputPath for now.
  }

  // Split by both separators to handle mixed paths, filter out empty parts
  const parts = pathWithoutDrive.split(/[\\/]+/).filter(p => p !== '');
  const resolvedParts: string[] = [];

  for (const part of parts) {
    if (part === '..') {
      if (
        resolvedParts.length > 0 &&
        resolvedParts[resolvedParts.length - 1] !== '..' && // Don't pop if previous was '..'
        !resolvedParts[resolvedParts.length - 1].endsWith(':') // Don't pop if previous was a drive root like 'C:'
      ) {
        resolvedParts.pop();
      } else if (isPathAbsolute || currentDriveLetter) {
        // If absolute or has a drive letter, '..' from the root or drive root just stays there
        // (or effectively means we're at the root, so don't add '..').
        // We do nothing, effectively staying at the root.
      } else {
        // For relative paths, add '..' if we can't go up further.
        resolvedParts.push('..');
      }
    } else if (part !== '.') {
      resolvedParts.push(part);
    }
  }

  let result = resolvedParts.join(targetSeparator);

  // Prepend drive letter and/or leading separator if necessary
  if (currentDriveLetter) {
    if (isPathAbsolute || result.startsWith(targetSeparator)) {
      // If absolute, or starts with a separator (like '/foo' on Windows), it becomes D:\foo
      result = currentDriveLetter + ':' + targetSeparator + result;
    } else if (result === '') {
        // If path is empty, could be D:\ or D:
        result = currentDriveLetter + ':' + (isPathAbsolute ? targetSeparator : '');
    } else {
        // If relative to drive, like D:foo
        result = currentDriveLetter + ':' + result;
    }
  } else if (isPathAbsolute) {
    result = targetSeparator + result;
  }

  // Handle cases where normalization results in an empty string
  if (result === '') {
      if (currentDriveLetter) {
          // If a drive letter was present, an empty path becomes D:\
          return currentDriveLetter + ':' + targetSeparator;
      }
      // If absolute, an empty path becomes /
      if (isPathAbsolute) {
          return targetSeparator;
      }
      // For relative empty path, it means '.'
      return '.';
  }

  return result;
}


export function fakePathDotResolve(...paths: string[]): string {
  // 1. Handle base cases
  if (paths.length === 0) {
    return '';
  }
  if (paths.length === 1) {
    const info = parsePath(paths[0]);
    const sep = info.separator || determineSystemSeparator();
    return normalizePath(paths[0], sep, info.isAbsolute, info.driveLetter);
  }

  // 2. Recursive reduction for more than two paths
  // Resolve the first two paths, then resolve the result with the next path, and so on.
  if (paths.length > 2) {
    const [first, second, ...rest] = paths;
    return fakePathDotResolve(fakePathDotResolve(first, second), ...rest);
  }

  // 3. Core logic for resolving two paths (paths.length === 2)
  const path1 = paths[0];
  const path2 = paths[1];

  const info1 = parsePath(path1);
  const info2 = parsePath(path2);

  let determinedSeparator: '/' | '\\' = determineSystemSeparator();
  let finalIsAbsolute = false;
  let finalDriveLetter: string | undefined = undefined;
  let resolvedPathString = '';

  // Determine the primary separator and drive letter based on detection priority
  if (info1.type !== PathType.None) {
    determinedSeparator = info1.separator!;
    finalDriveLetter = info1.driveLetter;
  } else if (info2.type !== PathType.None) {
    determinedSeparator = info2.separator!;
    finalDriveLetter = info2.driveLetter;
  }
  // If no type was detected in either, default to system separator and no initial drive letter.
  // determinedSeparator is already set to system default, finalDriveLetter remains undefined.


  // Determine the base path string and absolute status
  if (info2.isAbsolute) {
    finalIsAbsolute = true;

    // Exception case: first part is Win absolute with drive letter, second is Unix absolute
    if (
      info1.driveLetter &&
      info1.type === PathType.Windows &&
      info2.type === PathType.Linux
    ) {
      // "take drive letter from the first path, and the rest path from the last absolute path"
      // The example `D:/b` implies using '/' for the rest of path even if final separator is '\'.
      resolvedPathString = info1.driveLetter + ':' + '/' + info2.original.substring(1);
      finalDriveLetter = info1.driveLetter; // Keep drive letter from the first path
    } else {
      // Standard absolute path2 takes precedence
      resolvedPathString = info2.original;
      finalDriveLetter = info2.driveLetter; // Use drive letter from path2 if it has one
    }
  } else {
    // path2 is relative
    finalIsAbsolute = info1.isAbsolute;
    finalDriveLetter = info1.driveLetter;

    // Special handling for paths like 'D:' followed by a relative path
    // If path1 is just a drive letter (e.g., 'D:') it conceptually acts as 'D:\' for resolution
    if (info1.driveLetter && !info1.isAbsolute && info1.original.match(/^[a-zA-Z]:$/)) {
      // Treat 'D:' as 'D:\' for joining purposes before normalization
      resolvedPathString = info1.original + determinedSeparator + info2.original;
      finalIsAbsolute = true; // D:foo -> D:\foo, implies absolute to drive root
    } else {
      resolvedPathString = info1.original + determinedSeparator + info2.original;
    }
  }

  return normalizePath(resolvedPathString, determinedSeparator, finalIsAbsolute, finalDriveLetter);
}