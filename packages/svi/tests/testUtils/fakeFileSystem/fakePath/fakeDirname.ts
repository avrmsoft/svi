export function fakePathDotDirname(path: string): string {
    if (path.length === 0) {
        return '.';
    }

    // Determine the primary separator to use for the output.
    // Prioritize backslash if present for Windows paths, otherwise use forward slash.
    const hasBackslash = path.includes('\\');
    let originalSeparator = '/';
    if (hasBackslash) {
        originalSeparator = '\\';
    } else if (path.match(/^[a-zA-Z]:$/)) {
        // If path is a naked drive letter like "C:", treat it as Windows-style
        originalSeparator = '\\';
    }

    const normalizedSeparator = '/';
    // Normalize path to use only forward slashes internally for easier processing.
    let p = path.replace(/\\/g, normalizedSeparator);

    // Handle special cases matching Node.js path.dirname behavior
    if (path === '.') return '.';
    if (path === '..') return '.';
    if (path === normalizedSeparator) return originalSeparator; // '/' -> '/'
    if (path === originalSeparator) return originalSeparator;   // '\' -> '\' (if originalSeparator is '\')
    if (path === '//') return '/';   // '//' -> '/'
    if (path === '\\\\') return '\\\\'; // '\\\\' -> '\\\\' (Node.js specific for UNC root)


    // Determine the root boundary (index *after* the root part)
    let rootBoundary = 0;

    // Detect Windows Drive Letter Root (e.g., 'C:/')
    const driveMatch = p.match(/^([a-zA-Z]:)/);
    if (driveMatch) {
        rootBoundary = 2; // Length of 'C:'
        if (p.length > 2 && p[2] === normalizedSeparator) {
            rootBoundary = 3; // Length of 'C:/'
        }
    }
    // Detect UNC Root (e.g., '//server/share' or '//server')
    else if (p.startsWith(normalizedSeparator + normalizedSeparator)) {
        let tempRootEnd = 2; // After initial `//`
        let firstComponentEnd = p.indexOf(normalizedSeparator, tempRootEnd);
        if (firstComponentEnd === -1) {
            // Path is `//server` - the whole path is the root.
            rootBoundary = p.length;
        } else {
            let secondComponentEnd = p.indexOf(normalizedSeparator, firstComponentEnd + 1);
            if (secondComponentEnd === -1) {
                // Path is `//server/share` - the whole path is the root.
                rootBoundary = p.length;
            } else {
                // Path is `//server/share/foo` - the root part is `//server/share`.
                // `rootBoundary` should be the index of the separator *after* 'share'.
                rootBoundary = secondComponentEnd;
            }
        }
    }

    // 1. Trim trailing separators from the non-root part.
    // This ensures `foo/` becomes `foo`, but `C:/` remains `C:/`.
    let end = p.length - 1;
    while (end >= rootBoundary && p[end] === normalizedSeparator) {
        end--;
    }
    p = p.substring(0, end + 1);

    // If after trimming, the path is empty or just the root part.
    // This handles cases like `C:`, `foo`, `//server`, `//server/share`.
    if (p.length <= rootBoundary) {
        // If it was originally a drive letter like `C:` (without trailing slash)
        if (driveMatch && path.length === 2) {
            return '.';
        }
        // If it's a recognised root (C:/, //server/share, /), return itself.
        if (p.length === rootBoundary && rootBoundary > 0) {
            return p.replace(new RegExp(normalizedSeparator, 'g'), originalSeparator);
        }
        // For simple names like `foo`, `..`
        return '.';
    }

    // 2. Find the last separator in the remaining path (after root and trimming).
    let lastSepIndex = p.lastIndexOf(normalizedSeparator);

    // If the last separator is within the root or no segment beyond root (e.g. `C:/a`, `/a`).
    // Node.js `path.dirname('C:/a')` -> `C:/`
    // Node.js `path.dirname('/a')` -> `/`
    if (lastSepIndex < rootBoundary) {
        // This means `p` is something like `C:/a` where `rootBoundary` is 3, `lastSepIndex` is 2.
        // Or `/a` where `rootBoundary` is 0, `lastSepIndex` is 0.
        // In these cases, the parent is the identified root.
        if (rootBoundary > 0) {
            return p.substring(0, rootBoundary).replace(new RegExp(normalizedSeparator, 'g'), originalSeparator);
        }
        // This case is for an absolute path like `/a` where rootBoundary is 0 and lastSepIndex is 0.
        if (p.startsWith(normalizedSeparator)) {
            return originalSeparator; // Return root separator ('/')
        }
        return '.'; // Fallback, should ideally not be reached by well-formed paths.
    }

    // 3. General case: return the part before the last separator.
    let result = p.substring(0, lastSepIndex);

    // Convert back to original separator style before returning.
    return result.replace(new RegExp(normalizedSeparator, 'g'), originalSeparator);
}