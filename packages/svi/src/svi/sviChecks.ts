import { SVIParser } from "./sviParser";
import { SVIFile } from "./types";
import path from "path";
// Assuming a logger utility is available as used in SVIParser
// The actual path to the logger might vary based on project structure.
import logger from "../utils/logger";

export default class SviChecker {
  private sviParser: SVIParser;
  private errors: string[] = [];

  /**
   * Constructs an SviChecker instance.
   * @param sviParser An instance of SVIParser to parse SVI files.
   */
  constructor(sviParser: SVIParser) {
    this.sviParser = sviParser;
  }

  /**
   * Performs checks on a list of SVI files.
   * Currently checks for:
   * - Multiple SVI files generating the same destination file.
   * Accumulates critical errors internally. Use `logErrors()` to display them.
   *
   * @param sviFilePaths An array of full paths to the SVI files to check.
   * @returns `true` if all checks pass without critical errors, `false` otherwise.
   */
  public check(sviFilePaths: string[]): boolean {
    this.errors = []; // Clear errors from previous runs

    // Map to store resolved destination paths and the SVI files that generate them.
    // Key: Normalized full destination file path.
    // Value: Array of SVIFile objects that target this destination.
    const destinationMap = new Map<string, SVIFile[]>();

    for (const filePath of sviFilePaths) {
      let sviFile: SVIFile | null = null;
      try {
        sviFile = this.sviParser.parseFile(filePath);
        // Important: The SVIParser provided logs its own parsing errors/warnings via `logParseMessages`
        // which is often called within `parseFile` or expected to be called by the client *per file*.
        // If `parseFile` returns null, it indicates a critical parsing failure for that file
        // and its specific parsing errors would have been logged by the parser.
      } catch (e: any) {
        // Catch any synchronous errors thrown by SVIParser (e.g., file not found).
        this.errors.push(`Error: Failed to process SVI file '${filePath}': ${e.message}`);
        continue; // Skip this file for further checks if it couldn't be parsed at all.
      }

      if (!sviFile) {
        // If parsing failed critically (sviParser.parseFile returned null),
        // it implies that the SVI file content was malformed to an extent
        // that a valid SVIFile object could not be created.
        // The SVIParser would have already logged the specific formatting error(s)
        // related to this file, so we just skip it for the destination check.
        continue;
      }

      // Retrieve the full, resolved destination file path from the SVIFile object.
      // This method is expected to be implemented by the SVIFile concrete class
      // (e.g., SviFileClass) using `path.resolve` relative to `sviFile.filePath`.
      const destinationFileFullPath = sviFile.getDestinationFileFullPath();

      if (destinationFileFullPath) {
        // Normalize the path to ensure consistent comparison across different operating systems
        // (e.g., C:\path\to\file.js vs C:/path/to/file.js on Windows).
        const normalizedDestPath = path.normalize(destinationFileFullPath);

        if (destinationMap.has(normalizedDestPath)) {
          // If this destination path is already in the map, add the current SVI file to its list.
          destinationMap.get(normalizedDestPath)!.push(sviFile);
        } else {
          // If it's a new destination path, add it to the map with the current SVI file.
          destinationMap.set(normalizedDestPath, [sviFile]);
        }
      }
      // If destinationFileFullPath is undefined, it means this SVI file is a reusable prompt
      // and does not generate a final output file, so it's skipped for the destination collision check.
    }

    // After processing all files, iterate through the destination map to identify collisions.
    for (const [destPath, sviFiles] of destinationMap.entries()) {
      if (sviFiles.length > 1) {
        // If more than one SVI file targets the same destination path, it's a critical error.
        let errorMessage = `Error: Multiple SVI files are configured to generate the same destination file: '${destPath}':\n`;
        for (const svi of sviFiles) {
          errorMessage += `- ${svi.filePath}\n`;
        }
        this.errors.push(errorMessage.trim()); // Add the formatted error message.
      }
    }

    // Return true if no critical errors were found, false otherwise.
    return this.errors.length === 0;
  }

  /**
   * Logs all accumulated errors from the SviChecker's checks to the configured logger.
   * Note: This method logs errors specific to SviChecker's checks (e.g., destination collisions).
   * Parsing errors from SVIParser are typically logged by the SVIParser itself when parsing.
   */
  public logErrors(): void {
    for (const error of this.errors) {
      logger.error(error);
    }
  }
}