// tests\testUtils\fakeFileSystem\fakePath\fakeBasename.ts
export function fakePathDotBasename(path: string, ext?: string): string {
  if (typeof path !== 'string') {
    // For robustness, though the prompt implies string input
    return '';
  }

  let p = path.replace(/\\/g, '/'); // Normalize to Unix-like separators

  let len = p.length;
  if (len === 0) {
    return '';
  }

  let end = len;
  // Step 1: Strip all trailing slash characters
  while (end > 0 && p[end - 1] === '/') {
    end--;
  }

  // If the path was entirely slashes or empty after trimming
  if (end === 0) {
    return '';
  }

  // Step 2 & 3: Find the last segment
  let start = 0;
  for (let i = end - 1; i >= 0; i--) {
    if (p[i] === '/') {
      start = i + 1;
      break;
    }
  }

  let basename = p.substring(start, end);

  // Step 4: Handle ext argument
  if (ext && basename.length > 0 && basename.endsWith(ext)) {
    // Only remove the extension if it's not the entire basename
    // For example, basename 'file.txt', ext '.txt' -> 'file'
    // But if basename 'file.txt', ext 'file.txt' -> 'file.txt' (no change)
    // And if basename 'file', ext 'file' -> 'file' (no change)
    if (basename.length > ext.length) {
      basename = basename.substring(0, basename.length - ext.length);
    }
  }

  return basename;
}