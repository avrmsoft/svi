const SEP = "/";

/**
 * Converts a glob pattern into a regular expression.
 * Supports basic wildcards: `*` (matches anything except path separators),
 * `**` (matches anything including path separators), `?` (matches single character except path separators).
 * Does not support advanced glob features like character classes `[]` or brace expansion `{}`.
 */

export function globToRegExp(pattern: string): RegExp {
  // Normalize separators to /
  pattern = pattern.replace(/\\/g, "/");

  const sep = "/";
  let regex = "^";

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];

    if (char === "*") {
      const isDoubleStar = pattern[i + 1] === "*";
      const nextIsSep = pattern[i + 2] === sep;

      if (isDoubleStar) {
        if (nextIsSep) {
          // **/  → zero or more directories
          regex += "(?:.*/)?";
          i += 2;
        } else {
          // ** → anything, including /
          regex += ".*";
          i += 1;
        }
      } else {
        // * → anything except /
        regex += "[^/]*";
      }
      continue;
    }

    if (char === "?") {
      regex += "[^/]";
      continue;
    }

    // Escape regex specials
    if (/[.+|(){}[\]^$\\]/.test(char)) {
      regex += "\\" + char;
    } else {
      regex += char;
    }
  }

  regex += "$";
  return new RegExp(regex);
}

/*export function globToRegExp(pattern: string): RegExp {
  pattern = pattern.replace(/\\/g, SEP);

  const sep = SEP.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  let regex = "^";

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];

    switch (char) {
      case SEP:
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
}
*/
