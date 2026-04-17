declare const process: {
    platform: string;
};

enum PathStyle {
    Windows,
    Linux,
    Unknown,
}

// Helper for internal path style detection
const detectPathStyleInternal = (pathPart: string): PathStyle => {
    // 1. Check for Windows drive letter (e.g., D:\folder, C:/folder)
    if (/^[a-zA-Z]:[\\/]/.test(pathPart)) {
        return PathStyle.Windows;
    }
    // 2. Check for Windows separator
    if (pathPart.includes('\\')) {
        return PathStyle.Windows;
    }
    // 3. Check for Linux separator
    if (pathPart.includes('/')) {
        return PathStyle.Linux;
    }
    return PathStyle.Unknown;
};

export function fakePathDotResolve(...paths: string[]): string {
    let detectedStyle: PathStyle = PathStyle.Unknown;

    // Detect path style based on the first path part that provides a clear indicator (left-to-right)
    for (const pathPart of paths) {
        const style = detectPathStyleInternal(pathPart);
        if (style !== PathStyle.Unknown) {
            detectedStyle = style;
            break;
        }
    }

    // Determine the separator based on detected style or current OS default
    let resolvedSeparator: string;
    if (detectedStyle === PathStyle.Windows) {
        resolvedSeparator = '\\';
    } else if (detectedStyle === PathStyle.Linux) {
        resolvedSeparator = '/';
    } else {
        // If no style detected, fallback to current operating system
        // Assuming Node.js environment where `process` is available.
        resolvedSeparator = typeof process !== 'undefined' && process.platform === 'win32' ? '\\' : '/';
    }

    const resolvedSegments: string[] = [];
    let absolutePathFound = false;
    let dots = 0; // Counter for '..' segments that need to pop a path segment
    let rootPart = ''; // Stores the absolute root found (e.g., 'C:\', '/', '\\server\share')

    // Iterate paths from right to left (mimicking path.resolve's behavior for finding base)
    for (let i = paths.length - 1; i >= 0; i--) {
        let part = paths[i];
        if (part === '') {
            continue;
        }

        // Normalize internal separators of the current part to the resolvedSeparator
        if (resolvedSeparator === '\\') {
            part = part.replace(/\//g, '\\');
        } else if (resolvedSeparator === '/') {
            part = part.replace(/\\/g, '/');
        }

        // Check if the current 'part' is an absolute path and extract its root
        let isCurrentPartAbsolute = false;
        let currentPartRoot = '';
        let remainingPart = part;

        if (resolvedSeparator === '\\') {
            const driveMatch = part.match(/^([a-zA-Z]:)([\\/])?/);
            if (driveMatch) {
                isCurrentPartAbsolute = true;
                currentPartRoot = driveMatch[1].toUpperCase();
                if (driveMatch[2]) { // If it had C:\ or D:/
                    currentPartRoot += resolvedSeparator;
                } else if (part.length > 2 && !part.startsWith(currentPartRoot + resolvedSeparator)) {
                    // C:foo style, keep C: as root, but don't add separator unless next part needs it
                    // Path.resolve handles C: differently based on current drive. For fake, simplify.
                    // If C: is followed by non-separator, treat 'C:' as root prefix.
                } else {
                    currentPartRoot += resolvedSeparator; // Ensure C:\
                }
                remainingPart = part.substring(driveMatch[0].length);
            } else if (part.startsWith('\\\\')) { // UNC path
                const uncMatch = part.match(/^(\\\\[^\\/]+[\\/][^\\/]+)/); // Matches \\server\share
                if (uncMatch) {
                    isCurrentPartAbsolute = true;
                    currentPartRoot = uncMatch[1];
                    remainingPart = part.substring(uncMatch[1].length);
                } else if (part.startsWith('\\')) { // Simple Windows root '\'
                    isCurrentPartAbsolute = true;
                    currentPartRoot = '\\';
                    remainingPart = part.substring(1);
                }
            } else if (part.startsWith('\\')) { // Simple Windows root '\'
                isCurrentPartAbsolute = true;
                currentPartRoot = '\\';
                remainingPart = part.substring(1);
            }
        } else if (resolvedSeparator === '/') {
            if (part.startsWith('/')) {
                isCurrentPartAbsolute = true;
                currentPartRoot = '/';
                remainingPart = part.substring(1);
            }
        }

        // Split the (remaining, non-root) part into segments, filtering out empty ones
        const segments = remainingPart.split(resolvedSeparator).filter(s => s !== '');

        for (let j = segments.length - 1; j >= 0; j--) {
            const segment = segments[j];
            if (segment === '.') {
                continue; // Ignore '.' segments
            }
            if (segment === '..') {
                dots++; // Increment '..' counter
            } else if (dots > 0) {
                dots--; // Consume a '..' with this regular segment
            } else {
                resolvedSegments.unshift(segment); // Prepend regular segments to build path
            }
        }

        if (isCurrentPartAbsolute && !absolutePathFound) {
            absolutePathFound = true;
            rootPart = currentPartRoot; // Set the root from the rightmost absolute path
            // Any remaining 'dots' should not go above this root
            while(dots > 0 && resolvedSegments.length > 0) {
                resolvedSegments.shift();
                dots--;
            }
        }
    }

    let finalPath = resolvedSegments.join(resolvedSeparator);

    if (absolutePathFound) {
        // Prepend the determined absolute root
        finalPath = rootPart + finalPath;
    } else {
        // If no absolute path was found, prepend '..' for any remaining dots
        while (dots > 0) {
            finalPath = '..' + resolvedSeparator + finalPath;
            dots--;
        }
        // If no absolute path and no segments after '..', path.resolve returns CWD.
        // For fake, if it's empty, we return empty.
        // If it was just `../..` and `finalPath` is empty, it should be `../..`
        if (finalPath === '' && paths.length === 0) {
            return ''; // Or '.' like path.join, but problem implies a result.
        }
    }

    // Normalize redundant separators (e.g., `//` -> `/`, `\\` -> `\`)
    // Special handling for UNC paths: `\\server\share` should remain `\\`.
    // The regex needs to avoid reducing `\\\\` to `\` for UNC.
    let doubleSeparatorRegex;
    if (resolvedSeparator === '\\') {
        // For Windows, don't reduce UNC \\ (first two slashes)
        doubleSeparatorRegex = /(?<!^\\{1})\\{2,}/g; // Matches two or more backslashes not at start (for UNC)
        finalPath = finalPath.replace(doubleSeparatorRegex, resolvedSeparator);
        // Correct starting \\ for UNC paths if it was lost by previous segment processing.
        if (rootPart.startsWith('\\\\') && !finalPath.startsWith('\\\\')) {
             finalPath = '\\\\' + finalPath; // Simple fix, might not cover all UNC edge cases
        }
        // Ensure C: becomes C:\ if it's a root
        if(finalPath.match(/^[a-zA-Z]:$/)) {
            finalPath += resolvedSeparator;
        }
    } else { // Linux
        doubleSeparatorRegex = new RegExp(`${resolvedSeparator.replace(/\\/g, '\\\\')}{2,}`, 'g');
        finalPath = finalPath.replace(doubleSeparatorRegex, resolvedSeparator);
    }
    
    // If the path results in just the root (e.g., C:\ or /) and no other segments
    if (finalPath === resolvedSeparator && rootPart === resolvedSeparator && resolvedSegments.length === 0) {
        return resolvedSeparator;
    }
    if (finalPath.match(/^[a-zA-Z]:[\\/]?$/) && rootPart.match(/^[a-zA-Z]:[\\/]?$/) && resolvedSegments.length === 0) {
        return finalPath;
    }

    // Final cleanup for leading/trailing separators if they are not part of an absolute root
    if (resolvedSeparator === '/') {
        if (finalPath.length > 1 && finalPath.endsWith(resolvedSeparator)) {
            finalPath = finalPath.substring(0, finalPath.length - 1);
        }
        // Ensure leading `/` for absolute Linux paths
        if (absolutePathFound && !finalPath.startsWith('/')) {
             finalPath = '/' + finalPath;
        }
    } else if (resolvedSeparator === '\\') {
        if (finalPath.length > 1 && finalPath.endsWith(resolvedSeparator) && !finalPath.match(/^[a-zA-Z]:[\\/]$/)) {
            finalPath = finalPath.substring(0, finalPath.length - 1);
        }
        // Ensure drive letter or UNC root has a trailing separator if it's not just C:
        if (finalPath.match(/^[a-zA-Z]:$/)) {
             finalPath += resolvedSeparator;
        }
    }

    // if all paths were empty or just '.' and no absolute path, return empty string or '.'
    if (finalPath === '' && !absolutePathFound && paths.filter(p => p !== '' && p !== '.').length === 0) {
        return ''; // Node's path.resolve returns process.cwd() here. For "fake", '' is acceptable.
    }

    return finalPath;
}