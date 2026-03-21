// src\svi\sviChecks.ts
import ParsedSviDirectory from "./sviParser/parsedSviDirectory";
import { SVIFile, SviFileToLoad } from "./types";
import fs from "fs";
import path from "path";

export default class SviChecker {
  private errors: string[] = [];
  private parsedSviDirectory: ParsedSviDirectory;

  constructor() {
    this.parsedSviDirectory = ParsedSviDirectory.getInstance();
  }

  /**
   * Performs various correctness checks on a list of SVI files.
   * @param sviFilePaths A list of full paths to SVI files to check.
   * @returns `true` if all checks pass, `false` otherwise. Errors are stored internally.
   */
  public check(sviFilePaths: SviFileToLoad[]): boolean {
    this.errors = []; // Clear previous errors

    // Map to store parsed SVI files by their full path for easy lookup
    const parsedSviFilesMap = new Map<string, SVIFile>();

    // First pass: Parse all SVI files and store them.
    // This also ensures that any parsing failures are noted.
    for (const sviFileToLoad of sviFilePaths) {
      const sviFile = this.parsedSviDirectory.getParsedSviFile(sviFileToLoad.filePath);
      if (sviFile) {
        parsedSviFilesMap.set(sviFile.getSviFileFullPath(), sviFile);
      } else {
        // If parsing fails, we cannot reliably perform subsequent checks on this file.
        // An error is logged, and the file is skipped for further checks.
        this.errors.push(`Error: Failed to parse SVI file, skipping checks: ${sviFileToLoad.filePath}`);
      }
    }

    // Perform the specified checks using the parsed file map
    this.check1_DuplicateDestinationFiles(sviFilePaths, parsedSviFilesMap);
    this.check2_DestinationIsSelf(sviFilePaths, parsedSviFilesMap);
    this.check3_DestinationMultiLine(sviFilePaths, parsedSviFilesMap);

    return this.errors.length === 0;
  }

  /**
   * Check 1: Detects if several *.svi files (excluding those marked as preliminary)
   * are configured to generate the same destination file.
   */
  private check1_DuplicateDestinationFiles(
    sviFileToLoads: SviFileToLoad[],
    parsedSviFilesMap: Map<string, SVIFile>
  ): void {
    const destinationToFilePaths = new Map<string, string[]>(); // Map: destinationFullPath -> sviFileFullPaths[]

    for (const sviFileToLoad of sviFileToLoads) {
      // Per specification, ignore preliminary files for this check
      if (sviFileToLoad.isPreliminary) {
        continue;
      }

      const sviFile = parsedSviFilesMap.get(sviFileToLoad.filePath);
      if (!sviFile) {
        // This file either failed parsing or wasn't found in the map (error already logged by check method)
        continue;
      }

      const destinationFullPath = sviFile.getDestinationFileFullPath();

      if (destinationFullPath) {
        // Normalize the path to handle platform-specific differences (e.g., path separators)
        const normalizedDestinationPath = path.normalize(destinationFullPath);
        if (!destinationToFilePaths.has(normalizedDestinationPath)) {
          destinationToFilePaths.set(normalizedDestinationPath, []);
        }
        destinationToFilePaths.get(normalizedDestinationPath)!.push(sviFile.getSviFileFullPath());
      }
    }

    // Report errors for any destination paths that appeared more than once
    for (const [destination, sviPaths] of destinationToFilePaths.entries()) {
      if (sviPaths.length > 1) {
        let errorMessage = `Error: Multiple SVI files are configured to generate the same destination file: '${destination}':\n`;
        sviPaths.forEach(sviPath => {
          errorMessage += `- ${sviPath}\n`;
        });
        this.errors.push(errorMessage.trim()); // .trim() removes the last redundant newline
      }
    }
  }

  /**
   * Check 2: Detects if an *.svi file's destination points to itself.
   * Compares relative paths to ensure correctness and platform independence.
   */
  private check2_DestinationIsSelf(
    sviFileToLoads: SviFileToLoad[],
    parsedSviFilesMap: Map<string, SVIFile>
  ): void {
    for (const sviFileToLoad of sviFileToLoads) {
      const sviFile = parsedSviFilesMap.get(sviFileToLoad.filePath);
      if (!sviFile) {
        continue; // Skip if file not parsed
      }

      const sviRelativePath = sviFile.getSviFileRelativePath();
      const destinationRelativePath = sviFile.getDestinationFileRelativePath();

      if (sviRelativePath && destinationRelativePath) {
        // Normalize paths for reliable comparison (e.g., handling '/' vs '\' or redundant separators)
        const normalizedSviRelativePath = path.normalize(sviRelativePath);
        const normalizedDestinationRelativePath = path.normalize(destinationRelativePath);

        if (normalizedSviRelativePath === normalizedDestinationRelativePath) {
          this.errors.push(
            `Error in file ${sviFile.getSviFileFullPath()}: The destination file cannot be the same as the source file. Please change the destination file and try again.`
          );
        }
      }
    }
  }

  /**
   * Check 3: Detects if the # Destination section in an *.svi file contains more than one non-empty line.
   */
  private check3_DestinationMultiLine(
    sviFileToLoads: SviFileToLoad[],
    parsedSviFilesMap: Map<string, SVIFile>
  ): void {
    for (const sviFileToLoad of sviFileToLoads) {
      const sviFile = parsedSviFilesMap.get(sviFileToLoad.filePath);
      if (!sviFile) {
        continue; // Skip if file not parsed
      }

      // The 'destinationFile' property holds the raw string content directly from the SVI file section.
      const rawDestinationContent = sviFile.destinationFile;

      if (rawDestinationContent !== undefined) {
        // Split by common line endings and filter out empty lines to count meaningful entries
        const lines = rawDestinationContent
          .split(/\r?\n/) // Split by Windows (\r\n) or Unix (\n) line endings
          .filter(line => line.trim() !== ''); // Filter out lines that are empty or contain only whitespace

        if (lines.length > 1) {
          this.errors.push(
            `Error in file ${sviFile.getSviFileFullPath()}: More than one item in the # Destination section`
          );
        }
      }
    }
  }

  /**
   * Logs all accumulated error messages to the console (typically stderr).
   */
  public logErrors(): void {
    this.errors.forEach(error => console.error(error));
  }
}