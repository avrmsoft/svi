import fg from "fast-glob";

/**
 * A wrapper around the fast-glob library to facilitate mocking in tests.
 */
export const fastGlobWrapper = {
  /**
   * Finds files and directories asynchronously based on the given patterns and options.
   * @param patterns A string or an array of strings for glob patterns.
   * @param options Options for fast-glob.
   * @returns A promise that resolves to an array of matching file paths.
   */
  async fg(
    patterns: string | string[],
    options?: fg.Options,
  ): Promise<string[]> {
    return fg(patterns, options);
  },

  /**
   * Finds files and directories synchronously based on the given patterns and options.
   * @param patterns A string or an array of strings for glob patterns.
   * @param options Options for fast-glob.
   * @returns An array of matching file paths.
   */
  /*globSync(
    patterns: string | readonly string[],
    options?: fg.Options,
  ): string[] {
    return fg.sync(patterns, options);
  },*/
};
