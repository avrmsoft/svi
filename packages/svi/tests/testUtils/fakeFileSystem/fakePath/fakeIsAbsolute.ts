export function fakePathDotIsAbsolute(path: string): boolean {
  // If the path is empty, it cannot be absolute.
  if (path.length === 0) {
    return false;
  }

  // Check for Windows UNC paths: \\server\share or //server/share
  // Needs at least two characters.
  if (path.length >= 2) {
    const firstChar = path.charCodeAt(0);
    const secondChar = path.charCodeAt(1);

    // Check for '\\' or '//'
    if (
      (firstChar === 92 /* \ */ && secondChar === 92 /* \ */) ||
      (firstChar === 47 /* / */ && secondChar === 47 /* / */)
    ) {
      return true;
    }
  }

  // Check for Windows drive letter paths: C:\foo, C:/foo
  // Needs at least 3 characters.
  if (path.length >= 3) {
    const firstChar = path.charCodeAt(0);
    const secondChar = path.charCodeAt(1);
    const thirdChar = path.charCodeAt(2);

    // Check if the first character is an alphabet letter (A-Z or a-z)
    const isDriveLetter =
      (firstChar >= 65 /* A */ && firstChar <= 90 /* Z */) ||
      (firstChar >= 97 /* a */ && firstChar <= 122 /* z */);

    // Check if the second character is a colon (':')
    const hasColon = secondChar === 58 /* : */;

    // Check if the third character is a slash or backslash
    const hasSeparator = thirdChar === 92 /* \ */ || thirdChar === 47 /* / */;

    if (isDriveLetter && hasColon && hasSeparator) {
      return true;
    }
  }

  // Check for Unix-style absolute paths: /foo/bar
  // This is a single leading forward slash.
  if (path.charCodeAt(0) === 47 /* / */) {
    return true;
  }

  // Special case: Windows path starting with a single backslash: \foo\bar
  // This typically refers to the root of the current drive.
  if (path.charCodeAt(0) === 92 /* \ */) {
    return true;
  }

  return false;
}