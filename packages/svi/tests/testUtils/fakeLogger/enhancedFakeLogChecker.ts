/**
 * Interface for objects that can perform 'contains' and 'containsRegex' checks on a specific log range.
 */
interface ILineFinder {
    /**
     * Checks if the specified text is found within the current log range.
     * Throws an error if the text is not found.
     * @param text The text to search for.
     */
    contains(text: string): void;

    /**
     * Checks if the specified regular expression matches any line within the current log range.
     * Throws an error if the regex does not match.
     * @param regex The regular expression to search for.
     */
    containsRegex(regex: RegExp): void;
}

/**
 * Represents a checker for a specific range of log lines.
 * This class is used internally for chaining operations like `nextNLines` and `previousNLines`.
 */
class LineRangeChecker implements ILineFinder {
    private logLines: string[];
    private startIndex: number;
    private endIndex: number;
    private parentChecker: EnhancedFakeLogChecker; // Reference to the main checker for shared logic
    private rangeDescription: string;

    constructor(logLines: string[], startIndex: number, endIndex: number, parentChecker: EnhancedFakeLogChecker, rangeDescription: string) {
        this.logLines = logLines;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.parentChecker = parentChecker;
        this.rangeDescription = rangeDescription;
    }

    /**
     * Checks if the specified text is found within this specific log range.
     * Throws an error if the text is not found.
     * @param text The text to search for.
     */
    contains(text: string): void {
        this.parentChecker._checkContains(text, this.startIndex, this.endIndex, `Text "${text}" not found in the ${this.rangeDescription}.`);
    }

    /**
     * Checks if the specified regular expression matches any line within this specific log range.
     * Throws an error if the regex does not match.
     * @param regex The regular expression to search for.
     */
    containsRegex(regex: RegExp): void {
        this.parentChecker._checkContains(regex, this.startIndex, this.endIndex, `Regex "${regex.source}" not found in the ${this.rangeDescription}.`);
    }
}

/**
 * Represents the state after an initial `contains` or `containsRegex` call,
 * allowing for further chaining with `and().nextNLines()` or `and().previousNLines()`.
 */
class FirstMatchChecker {
    private logLines: string[];
    private firstMatchIndex: number;
    private parentChecker: EnhancedFakeLogChecker;

    constructor(logLines: string[], firstMatchIndex: number, parentChecker: EnhancedFakeLogChecker) {
        this.logLines = logLines;
        this.firstMatchIndex = firstMatchIndex;
        this.parentChecker = parentChecker;
    }

    /**
     * Allows chaining further conditions. Does nothing but returns itself.
     * @returns This instance for chaining.
     */
    and(): this {
        return this;
    }

    /**
     * Specifies that the next check should be performed within the `n` lines
     * immediately following the initial match.
     * @param n The number of lines to check after the first match.
     * @returns An `ILineFinder` object for performing checks within this range.
     * @throws {Error} if n is not a positive number.
     */
    nextNLines(n: number): ILineFinder {
        if (n <= 0) {
            throw new Error("n must be a positive number for nextNLines.");
        }
        // Start from the line *after* the first match, up to n lines from there.
        const startIndex = this.firstMatchIndex + 1;
        const endIndex = Math.min(this.firstMatchIndex + 1 + n, this.logLines.length);
        return new LineRangeChecker(this.logLines, startIndex, endIndex, this.parentChecker, `next ${n} lines after the first match (lines ${startIndex} to ${endIndex - 1})`);
    }

    /**
     * Specifies that the next check should be performed within the `n` lines
     * immediately preceding the initial match.
     * @param n The number of lines to check before the first match.
     * @returns An `ILineFinder` object for performing checks within this range.
     * @throws {Error} if n is not a positive number.
     */
    previousNLines(n: number): ILineFinder {
        if (n <= 0) {
            throw new Error("n must be a positive number for previousNLines.");
        }
        // Start from n lines before the first match, up to the line *before* the first match.
        const startIndex = Math.max(0, this.firstMatchIndex - n);
        const endIndex = this.firstMatchIndex; // Exclusive, so it's up to but not including the firstMatchIndex
        return new LineRangeChecker(this.logLines, startIndex, endIndex, this.parentChecker, `previous ${n} lines before the first match (lines ${startIndex} to ${endIndex - 1})`);
    }
}

/**
 * A utility class to perform advanced checks on an array of log lines.
 * It supports fluent API for chaining conditions like finding text and then
 * checking for another text in subsequent or preceding lines.
 */
export default class EnhancedFakeLogChecker {
    private logLines: string[];

    /**
     * Creates an instance of EnhancedFakeLogChecker.
     * @param logLines An array of strings, where each string is a log line.
     * @throws {Error} if logLines is not a valid array of strings.
     */
    constructor(logLines: string[]) {
        if (!Array.isArray(logLines) || logLines.some(line => typeof line !== 'string')) {
            throw new Error("Log lines must be an array of strings.");
        }
        this.logLines = logLines;
    }

    /**
     * Private helper to find the index of the first line containing the specified text or regex
     * within a given range.
     * @param searchText The text (string) or regular expression (RegExp) to search for.
     * @param startIndex The inclusive starting index of the search range.
     * @param endIndex The exclusive ending index of the search range.
     * @returns The index of the first matching line, or -1 if not found.
     */
    private _findLineIndex(
        searchText: string | RegExp,
        startIndex: number,
        endIndex: number
    ): number {
        for (let i = startIndex; i < endIndex; i++) {
            const line = this.logLines[i];
            if (line === undefined) {
                continue; // Skip undefined entries, though logLines should ideally not contain them.
            }
            if (typeof searchText === 'string') {
                if (line.includes(searchText)) {
                    return i;
                }
            } else { // RegExp
                if (searchText.test(line)) {
                    return i;
                }
            }
        }
        return -1;
    }

    /**
     * Private helper to check if the specified text or regex is found within a given range.
     * Throws an error with a custom message if not found.
     * @param searchText The text (string) or regular expression (RegExp) to search for.
     * @param startIndex The inclusive starting index of the search range.
     * @param endIndex The exclusive ending index of the search range.
     * @param errorMessage The error message to throw if the text/regex is not found.
     */
    _checkContains(
        searchText: string | RegExp,
        startIndex: number,
        endIndex: number,
        errorMessage: string
    ): void {
        const foundIndex = this._findLineIndex(searchText, startIndex, endIndex);
        if (foundIndex === -1) {
            throw new Error(errorMessage);
        }
    }

    /**
     * Initiates a check for a specific text within the entire log.
     * If found, it returns a `FirstMatchChecker` object to allow chaining further conditions
     * like `and().nextNLines()` or `and().previousNLines()`.
     * @param text The text to search for.
     * @returns A `FirstMatchChecker` object for chaining.
     * @throws {Error} if the text is not found in the log.
     */
    contains(text: string): FirstMatchChecker {
        const foundIndex = this._findLineIndex(text, 0, this.logLines.length);
        if (foundIndex === -1) {
            throw new Error(`Text "${text}" not found in log.`);
        }
        return new FirstMatchChecker(this.logLines, foundIndex, this);
    }

    /**
     * Initiates a check for a specific regular expression within the entire log.
     * If found, it returns a `FirstMatchChecker` object to allow chaining further conditions
     * like `and().nextNLines()` or `and().previousNLines()`.
     * @param regex The regular expression to search for.
     * @returns A `FirstMatchChecker` object for chaining.
     * @throws {Error} if the regex is not found in the log.
     */
    containsRegex(regex: RegExp): FirstMatchChecker {
        const foundIndex = this._findLineIndex(regex, 0, this.logLines.length);
        if (foundIndex === -1) {
            throw new Error(`Regex "${regex.source}" not found in log.`);
        }
        return new FirstMatchChecker(this.logLines, foundIndex, this);
    }

    /**
     * Initiates a check within the last `n` lines of the log.
     * @param n The number of lines to consider from the end of the log.
     * @returns An `ILineFinder` object for performing `contains` or `containsRegex` checks within this range.
     * @throws {Error} if n is not a positive number.
     */
    lastNLines(n: number): ILineFinder {
        if (n <= 0) {
            throw new Error("n must be a positive number for lastNLines.");
        }
        const startIndex = Math.max(0, this.logLines.length - n);
        const endIndex = this.logLines.length;
        return new LineRangeChecker(this.logLines, startIndex, endIndex, this, `last ${n} lines (lines ${startIndex} to ${endIndex - 1})`);
    }
}