export function fakePathDotResolve(...paths: string[]): string {
    let detectedIsWindows: boolean | undefined = undefined;

    const cleanedPaths = paths.filter(p => p !== null && p !== undefined && p !== '');

    if (cleanedPaths.length === 0) {
        return '';
    }

    // Step 1: Detect path system (Windows or Linux)
    // How to detect:
    // - Take the first part of the path;
    // - If it contains a starting path with a drive letter, e.g., `D:\\folder`, it is windows
    // - If it contains the windows separator `\\`, it is windows
    // - If it contains the Linux separator, it is linux
    // - If the part contains no signs of linux/windows path, it is not detected
    // - If the first parts is not detected (windows or linux), then go to the second part
    // - If no part is detected, then detect path separator according to current operating
    //   system (windows or not)

    for (const pathPart of cleanedPaths) {
        // Windows detection: drive letter, backslash, or UNC path start
        if (/^[a-zA-Z]:(\\|\/|$)/.test(pathPart) || pathPart.includes('\\') || pathPart.startsWith('//') || pathPart.startsWith('\\\\')) {
            detectedIsWindows = true;
            break;
        }
        // Linux detection: forward slash (only if not already detected as Windows)
        if (pathPart.includes('/')) {
            // Ensure this is truly a Linux indicator and not a mixed Windows path like 'C:/folder'
            // The order of checks handles this, as Windows detection is prior.
            detectedIsWindows = false;
            break;
        }
    }

    // Fallback: If no part explicitly detected, use current OS.
    if (detectedIsWindows === undefined) {
        detectedIsWindows = (typeof process !== 'undefined' && process.platform === 'win32');
    }

    const chosenSeparator = detectedIsWindows ? '\\' : '/';

    // Step 2: Determine effective segments, handling absolute path discarding (like path.resolve).
    // Iterate through paths from right to left, and if an absolute path is found,
    // all preceding segments are discarded.
    let effectiveSegments: string[] = [];

    for (let i = cleanedPaths.length - 1; i >= 0; i--) {
        const part = cleanedPaths[i];

        // Normalize separators in the current part to the chosen separator type for consistent checking
        const normalizedPart = detectedIsWindows ? part.replace(/\//g, '\\') : part.replace(/\\/g, '/');
        
        effectiveSegments.unshift(normalizedPart); // Add to the front of the list

        // Check if this part is an absolute path based on the detected type
        let isCurrentPartAbsolute = false;
        if (detectedIsWindows) {
            // Windows absolute paths: start with drive letter (C:\, C:/), or leading separator (\foo, /foo, \\server)
            isCurrentPartAbsolute = /^[a-zA-Z]:[/\\]?/.test(normalizedPart) || /^[/\\]/.test(normalizedPart);
        } else {
            // Linux absolute paths: start with a forward slash (e.g., /home)
            isCurrentPartAbsolute = normalizedPart.startsWith('/');
        }

        if (isCurrentPartAbsolute) {
            // If an absolute path is encountered, discard all segments to its left.
            // This is achieved by stopping the loop and only keeping `effectiveSegments` found so far.
            break; 
        }
    }

    if (effectiveSegments.length === 0) {
        return '';
    }

    // Step 3: Merge effective segments with the chosen separator, and normalize the result.
    let result = '';
    for (const segment of effectiveSegments) {
        if (result === '') {
            result = segment;
        } else {
            const resultEndsWithSep = result.endsWith(chosenSeparator);
            const segmentStartsWithSep = segment.startsWith(chosenSeparator);

            if (resultEndsWithSep && segmentStartsWithSep) {
                // If both have separators, remove the leading one from the segment to avoid double separators
                result += segment.substring(1); 
            } else if (!resultEndsWithSep && !segmentStartsWithSep) {
                // If neither has a separator, add one in between
                result += chosenSeparator + segment;
            } else {
                // If one has a separator and the other doesn't, just append
                result += segment; 
            }
        }
    }

    // Final normalization passes:
    // 1. Replace multiple separators (`//`, `\\`) with a single one.
    const doubleSepRegex = new RegExp(`${chosenSeparator.replace(/\\/g, '\\\\')}{2,}`, 'g');
    result = result.replace(doubleSepRegex, chosenSeparator);

    // 2. Handle specific Windows drive letter roots (e.g., `C:` should become `C:\`).
    // This ensures a trailing separator for a root drive if no path follows.
    if (detectedIsWindows && /^[a-zA-Z]:$/.test(result)) {
        result += chosenSeparator;
    }

    // 3. Remove trailing separator UNLESS it's a valid root path (e.g., `C:\` or `/`).
    // Example: `foo/bar/` -> `foo/bar`, but `C:\` remains `C:\`.
    if (result.length > 1 && result.endsWith(chosenSeparator)) {
        // Check if the path is a root (e.g., 'C:\', '/')
        const isRootPath = detectedIsWindows ? /^[a-zA-Z]:[/\\]$/.test(result) : /^\/$/.test(result);
        if (!isRootPath) {
            result = result.substring(0, result.length - 1);
        }
    }

    return result;
}