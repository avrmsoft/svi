import { describe, it, expect } from 'vitest';
import EnhancedFakeLogChecker from './../../testUtils/fakeLogger/enhancedFakeLogChecker';

describe('EnhancedFakeLogChecker', () => {
    const sampleLog = [
        "Log line 1: Start of process",
        "Log line 2: Initializing module A",
        "Log line 3: Some important event occurred",
        "Log line 4: Processing data batch 1",
        "Log line 5: Found configuration for task ID 123",
        "Log line 6: Data processing complete",
        "Log line 7: Finalizing connections",
        "Log line 8: Cleanup done",
        "Log line 9: Application shutting down",
        "Log line 10: Process ended successfully",
    ];

    // 1. Check if last N lines contains text
    describe('lastNLines contains text', () => {
        it('should pass if the text is found in the last N lines (positive case)', () => {
            const checker = new EnhancedFakeLogChecker(sampleLog);
            // "Application shutting down" is in line 9 (index 8), which is in the last 2 lines.
            expect(() => checker.lastNLines(2).contains("Application shutting down")).not.toThrow();
        });

        it('should throw an error if the text is not found in the last N lines (negative case)', () => {
            const checker = new EnhancedFakeLogChecker(sampleLog);
            // "Start of process" is in line 1 (index 0), not in the last 5 lines.
            expect(() => checker.lastNLines(5).contains("Start of process")).toThrow(`Text "Start of process" not found in the last 5 lines`);
        });
    });

    // 2. The log contains a text, and in 3 previous line there is another text
    describe('contains text and in previous N lines another text', () => {
        it('should pass if the previous text is found within 3 lines before the main text (positive case)', () => {
            const checker = new EnhancedFakeLogChecker(sampleLog);
            // "Initializing module A" (index 1) is 2 lines before "Some important event occurred" (index 2).
            expect(() => checker.contains("Some important event occurred").and().previousNLines(3).contains("Initializing module A")).not.toThrow();
        });

        it('should throw an error if the previous text exists but not in the previous 3 lines (negative case)', () => {
            const checker = new EnhancedFakeLogChecker(sampleLog);
            // "Start of process" (index 0) is 4 lines before "Processing data batch 1" (index 3).
            // Previous 3 lines for "Processing data batch 1" (index 3) would be indices 0, 1, 2.
            // Oh, wait, the implementation `previousNLines(n)` takes lines from `firstMatchIndex - n` to `firstMatchIndex - 1`.
            // So for `main text` at index 3, previous 3 lines would be indices `3-3=0` to `3-1=2`.
            // Thus, `previousNLines(3)` from index 3 includes index 0, 1, 2. So "Start of process" at index 0 *would* be found.
            // Let's adjust the negative case for clarity:
            // "Start of process" (index 0) is 4 lines before "Found configuration for task ID 123" (index 4).
            // Previous 3 lines for index 4 are indices 1, 2, 3. "Start of process" at index 0 is NOT included.
            expect(() => checker.contains("Found configuration for task ID 123").and().previousNLines(3).contains("Start of process")).toThrow(`Text "Start of process" not found in the previous 3 lines before the first match`);
        });
    });

    // 3. Check ordinary contains
    describe('contains', () => {
        it('should pass if the log contains the text (positive case)', () => {
            const checker = new EnhancedFakeLogChecker(sampleLog);
            expect(() => checker.contains("Initializing module A")).not.toThrow();
        });

        it('should throw an error if the log does not contain the text (negative case)', () => {
            const checker = new EnhancedFakeLogChecker(sampleLog);
            expect(() => checker.contains("This text is not in the log")).toThrow(`Text "This text is not in the log" not found in log.`);
        });
    });

    // 4. Check ordinary containsRegex
    describe('containsRegex', () => {
        it('should pass if the log contains a line matching the regex (positive case)', () => {
            const checker = new EnhancedFakeLogChecker(sampleLog);
            expect(() => checker.containsRegex(/module A/)).not.toThrow();
        });

        it('should throw an error if the log does not contain a line matching the regex (negative case)', () => {
            const checker = new EnhancedFakeLogChecker(sampleLog);
            expect(() => checker.containsRegex(/NonExistentRegex/)).toThrow(`Regex "NonExistentRegex" not found in log.`);
        });
    });
});