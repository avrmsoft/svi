import { globToRegExp } from "./globToRegExp";

interface testFile {
  fullPath: string;
  content?: string;
}

/**
 * PathUtils provides cross-platform path manipulation utilities.
 * It internally uses POSIX separators ('/') and handles Windows drive letters.
 */
class PathUtils {
  static SEP = "/";

  /**
   * Determines if a path is absolute.
   * Handles Windows drive letters (C:\, C:/, C:) and Unix root (/, \\).
   */
  static isAbsolute(path: string): boolean {
    if (!path) return false;
    // Check for Windows drive letter: C:/, C:\ or C: (as root implies C:/)
    if (path.match(/^[a-zA-Z]:(\/|\\|$)/) !== null) {
      return true;
    }
    // Check for Unix root: / or \\ (which becomes / after normalization)
    if (path.startsWith(PathUtils.SEP) || path.startsWith("\\")) {
      return true;
    }
    return false;
  }

  /**
   * Internal helper to parse a path into its drive/root and segments.
   * Always converts to POSIX separators.
   */
  private static parsePath(path: string): {
    drive: string;
    root: string;
    segments: string[];
  } {
    path = path.replace(/\\/g, PathUtils.SEP);
    let drive = "";
    let root = "";
    let segments: string[] = [];

    const driveMatch = path.match(/^([a-zA-Z]:)/);
    if (driveMatch !== null) {
      drive = driveMatch[1].toUpperCase();
      path = path.substring(drive.length);
    }

    if (path.startsWith(PathUtils.SEP)) {
      root = PathUtils.SEP;
      path = path.substring(1);
    }

    if (path.length > 0) {
      segments = path.split(PathUtils.SEP).filter((p) => p.length > 0);
    }

    return { drive, root, segments };
  }

  /**
   * Normalizes a path, resolving '..' and '.', removing redundant slashes.
   */
  static normalize(path: string): string {
    if (!path) return "";

    const { drive, root, segments } = PathUtils.parsePath(path);
    const resolvedSegments: string[] = [];

    for (const segment of segments) {
      if (segment === ".") {
        continue;
      }
      if (segment === "..") {
        if (
          resolvedSegments.length > 0 &&
          resolvedSegments[resolvedSegments.length - 1] !== ".."
        ) {
          resolvedSegments.pop();
        } else if (!drive && !root) {
          // Only add '..' if it's truly going above root in a relative path
          resolvedSegments.push("..");
        }
      } else {
        resolvedSegments.push(segment);
      }
    }

    let result = resolvedSegments.join(PathUtils.SEP);

    if (root) {
      result = root + result;
    }
    if (drive) {
      result = drive + result;
    }

    // Handle special cases for root paths like '', 'C:', '/'
    if (result === "") {
      if (drive) return drive + PathUtils.SEP; // e.g., 'C:' -> 'C:/'
      if (root) return root; // e.g., '/' -> '/'
      return "."; // e.g., '' -> '.'
    }

    // Remove trailing slash if it's not a root path (e.g. C:/a/ -> C:/a, but C:/ stays C:/)
    if (
      result.length > 1 &&
      result.endsWith(PathUtils.SEP) &&
      result !== PathUtils.SEP &&
      !result.match(/^[a-zA-Z]:\/$/)
    ) {
      result = result.slice(0, -1);
    }

    return result;
  }

  /**
   * Joins all given path segments together and normalizes the resulting path.
   * If a segment is absolute, it overrides previous parts.
   */
  static join(...segments: string[]): string {
    if (segments.length === 0) return ".";
    let fullPath = segments.shift() || "";

    for (const segment of segments) {
      if (segment === null || segment === undefined || segment === "") continue;
      if (PathUtils.isAbsolute(segment)) {
        fullPath = segment; // If a segment is absolute, it overrides all preceding segments
      } else {
        if (
          fullPath.endsWith(PathUtils.SEP) &&
          segment.startsWith(PathUtils.SEP)
        ) {
          fullPath += segment.substring(1);
        } else if (
          fullPath.endsWith(PathUtils.SEP) ||
          segment.startsWith(PathUtils.SEP)
        ) {
          fullPath += segment;
        } else {
          fullPath += PathUtils.SEP + segment;
        }
      }
    }
    return PathUtils.normalize(fullPath);
  }

  /**
   * Resolves a target path from a base path.
   * If target is absolute, it returns the normalized target.
   * Otherwise, it joins base and target and normalizes.
   */
  static resolve(base: string, target: string): string {
    if (PathUtils.isAbsolute(target)) {
      return PathUtils.normalize(target);
    }
    return PathUtils.join(base, target);
  }

  /**
   * Calculates the relative path from 'from' to 'to'.
   * Both 'from' and 'to' should ideally be absolute for a meaningful result.
   */
  static relative(from: string, to: string): string {
    const fromNormalized = PathUtils.normalize(from);
    const toNormalized = PathUtils.normalize(to);

    if (fromNormalized === toNormalized) return ".";

    const fromParsed = PathUtils.parsePath(fromNormalized);
    const toParsed = PathUtils.parsePath(toNormalized);

    // If drives or root types differ, no relative path is possible.
    // Return the absolute 'to' path.
    if (
      fromParsed.drive !== toParsed.drive ||
      fromParsed.root !== toParsed.root
    ) {
      return toNormalized;
    }

    let commonLength = 0;
    while (
      commonLength < fromParsed.segments.length &&
      commonLength < toParsed.segments.length &&
      fromParsed.segments[commonLength] === toParsed.segments[commonLength]
    ) {
      commonLength++;
    }

    const up = fromParsed.segments.length - commonLength;
    const down = toParsed.segments.slice(commonLength);

    const relativeSegments: string[] = [];
    for (let i = 0; i < up; i++) {
      relativeSegments.push("..");
    }
    relativeSegments.push(...down);

    return relativeSegments.length > 0
      ? relativeSegments.join(PathUtils.SEP)
      : ".";
  }
}

/**
 * Converts a glob pattern into a regular expression.
 * Supports basic wildcards: `*` (matches anything except path separators),
 * `**` (matches anything including path separators), `?` (matches single character except path separators).
 * Does not support advanced glob features like character classes `[]` or brace expansion `{}`.
 */
/*function globToRegExp(pattern: string): RegExp {
  pattern = pattern.replace(/\\/g, PathUtils.SEP);

  const sep = PathUtils.SEP.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  let regex = "^";

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];

    switch (char) {
      case PathUtils.SEP:
        regex += sep;
        break;

      case "*":
        if (pattern[i + 1] === "*") {
          // ** → zero or more path segments
          regex += `(?:${sep}.*)?`;
          i++;
        } else {
          // * → one segment
          regex += `[^${sep}]*`;
        }
        break;

      case "?":
        regex += `[^${sep}]`;
        break;

      default:
        regex += /[.+|(){}[\]^$\\]/.test(char) ? "\\" + char : char;
    }
  }

  regex += "$";
  return new RegExp(regex);
}*/

export default class FakeFileSystemHelper {
  constructor(
    private files: testFile[] = [],
    private fakeCwd: string,
  ) {
    // Normalize all initial file paths and fakeCwd to POSIX format for internal consistency
    this.fakeCwd = PathUtils.normalize(fakeCwd);
    this.files = files.map((file) => ({
      ...file,
      fullPath: PathUtils.normalize(file.fullPath),
    }));
  }

  /**
   * Performs a glob-like search on the virtual file system.
   * It matches file paths against provided patterns, similar to the `fast-global` library.
   *
   * @param patterns A glob pattern string or an array of glob pattern strings.
   * @param options An object with optional `cwd` and `absolute` properties.
   *                `cwd`: The current working directory to resolve relative patterns against.
   *                       Defaults to the `fakeCwd` provided in the constructor.
   *                `absolute`: If true, returned paths will be absolute.
   *                            If false (default), returned paths will be relative to `cwd`.
   * @returns A promise that resolves to an array of matched file paths.
   */
  public async fg(
    patterns: string | string[],
    options: { cwd?: string; absolute?: boolean } = {},
  ): Promise<string[]> {
    const effectiveCwd = PathUtils.normalize(options.cwd || this.fakeCwd);
    const resultPaths: Set<string> = new Set();
    const patternsArray = Array.isArray(patterns) ? patterns : [patterns];

    for (const pattern of patternsArray) {
      // Resolve the pattern to an absolute path based on the effectiveCwd
      // This allows the glob regex to match against absolute file paths directly.
      const patternAbsolutePath = PathUtils.isAbsolute(pattern)
        ? PathUtils.normalize(pattern)
        : PathUtils.resolve(effectiveCwd, pattern);

      // Convert the resolved glob pattern to a regular expression
      const regex = globToRegExp(patternAbsolutePath);

      for (const file of this.files) {
        if (regex.test(file.fullPath)) {
          let outputPath: string;
          if (options.absolute) {
            outputPath = file.fullPath;
          } else {
            // Return path relative to effectiveCwd
            outputPath = PathUtils.relative(effectiveCwd, file.fullPath);
          }
          resultPaths.add(outputPath);
        }
      }
    }

    // Sort results for consistent output, as glob libraries usually do
    const sortedPaths = Array.from(resultPaths).sort();
    return sortedPaths;
  }
}
