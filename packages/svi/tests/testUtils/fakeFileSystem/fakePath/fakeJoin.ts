export function fakePathDotJoin(...paths: string[]): string {
    if (paths.length === 0) {
        return '.';
    }

    let isWindowsFormat = false;
    let pathIsAbsolute = false;
    let pathRoot = ''; // Stores things like 'C:' or '/' (internal consistent representation)

    // Make a mutable copy of paths if needed, as we modify paths[0]
    const processedPaths = [...paths];

    // Determine initial format and root from the first path
    const firstPath = processedPaths[0];

    // Check for Windows drive letter
    const driveMatch = firstPath.match(/^([a-zA-Z]:)/);
    if (driveMatch) {
        pathRoot = driveMatch[1]; // e.g., 'C:'
        isWindowsFormat = true;
        processedPaths[0] = firstPath.substring(pathRoot.length); // Remove drive part for further processing
    }

    // Check for absolute path (starts with / or \)
    if (processedPaths[0].startsWith('/')) {
        pathRoot = (pathRoot ? pathRoot : '') + '/'; // Append '/' if drive exists, else just '/'
        pathIsAbsolute = true;
        processedPaths[0] = processedPaths[0].substring(1); // Remove leading slash for component splitting
    } else if (processedPaths[0].startsWith('\\')) {
        pathRoot = (pathRoot ? pathRoot : '') + '\\'; // Append '\' if drive exists, else just '\'
        pathIsAbsolute = true;
        isWindowsFormat = true; // Implicitly Windows format if starts with \
        processedPaths[0] = processedPaths[0].substring(1); // Remove leading backslash for component splitting
    }

    // If no absolute root found yet, but the path contains backslashes, assume Windows format
    // This happens for relative paths like "foo\bar"
    if (!pathIsAbsolute && processedPaths[0].includes('\\')) {
        isWindowsFormat = true;
    }

    const resolvedComponents: string[] = [];

    for (let i = 0; i < processedPaths.length; i++) {
        let currentPath = processedPaths[i];

        // Normalize separators to '/' for internal processing
        currentPath = currentPath.replace(/\\/g, '/');
        // Remove multiple consecutive slashes
        currentPath = currentPath.replace(/\/\/+/g, '/');

        if (i > 0) {
            // As per requirement, all parts except the first are considered relative.
            // So, remove any drive letters or leading slashes.
            currentPath = currentPath.replace(/^[a-zA-Z]:/, '').replace(/^\//, '');
        }

        const currentComponents = currentPath.split('/');

        for (const component of currentComponents) {
            if (component === '' || component === '.') {
                continue;
            }
            if (component === '..') {
                // If there are components to pop and the last one isn't '..'
                // and we are not at the logical root (e.g., C:/ or /)
                if (resolvedComponents.length > 0 && resolvedComponents[resolvedComponents.length - 1] !== '..') {
                    resolvedComponents.pop();
                } else if (pathIsAbsolute && resolvedComponents.length === 0) {
                    // If it's an absolute path and we are at its root, '..' cannot go above.
                    // E.g., '/../' should resolve to '/'
                    continue;
                } else {
                    // If we can't pop, or the previous component was also '..', push '..'
                    resolvedComponents.push(component);
                }
            } else {
                resolvedComponents.push(component);
            }
        }
    }

    let result = resolvedComponents.join('/');

    // Prepend the determined root (adjusted for internal '/' representation)
    if (pathIsAbsolute) {
        if (pathRoot.match(/^[a-zA-Z]:$/)) { // Case: pathRoot is 'C:'
            result = pathRoot + (result.length > 0 ? '/' + result : '/'); // Ensures C:/ or C:/foo
        } else if (pathRoot.endsWith('/')) { // Case: pathRoot is '/' or 'C:/'
            result = pathRoot + result; // Ensures /foo or C:/foo
        } else if (pathRoot.endsWith('\\')) { // Case: pathRoot is '\' or 'C:\' (internal for 'C:/')
            // This case should be handled by normalization earlier, but as a safeguard.
            result = pathRoot.replace(/\\/g, '/') + result;
        }
    } else if (resolvedComponents.length === 0) {
        // If it was a relative path and resolved to nothing (e.g., 'a/..', './', '')
        result = '.';
    }

    // Convert to target separator based on the initial path's format
    const finalSeparator = isWindowsFormat ? '\\' : '/';
    result = result.replace(/\//g, finalSeparator);

    // Final check for drive-only paths like 'C:' or 'C:\' that should ensure a trailing separator
    // if no other segments exist, matching 'path.join' behavior for root drives.
    if (isWindowsFormat && result.match(/^[a-zA-Z]:$/)) {
        result += '\\';
    }

    return result;
}