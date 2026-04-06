import { checkResults, OneSviCheck } from "./types";
import { SviFileToLoad, SVIFile } from "../types";
import ParsedSviDirectory from "../sviParser/parsedSviDirectory";
import fs from "fs";
import path from "path";

/**
 * Checks that no two non‑preliminary SVI files resolve to the same destination file.
 * If a conflict is found, an error message is added to the result.
 */
export default class SviCheckSeveralFilesHaveSameDestination implements OneSviCheck {
  /**
   * Main entry point required by the OneSviCheck interface.
   * @param sviFilePaths Array of SviFileToLoad objects representing the files to be checked.
   * @returns checkResults containing validity flag and any error messages.
   */
  check(sviFilePaths: SviFileToLoad[]): checkResults {
    // Map: resolved destination path -> list of source .svi file paths that target it
    const destinationFiles: { [key: string]: string[] } = {};
    const errors: string[] = [];

    // Singleton instance to avoid re‑parsing the same files repeatedly
    const parsedSviDirectory = ParsedSviDirectory.getInstance();

    // 1️⃣ Gather destinations, ignoring preliminary files
    sviFilePaths.forEach((sviFileToLoad) => {
      if (sviFileToLoad.isPreliminary) return; // skip allowed duplicates

      const sviFile = parsedSviDirectory.getParsedSviFile(sviFileToLoad.filePath);
      if (!sviFile) return; // parsing failed – nothing to check

      const destinationFile = sviFile.getDestinationFileFullPath();
      if (!destinationFile) return; // file does not produce an output – ignore

      // Record the source file under its destination
      if (destinationFiles[destinationFile]) {
        destinationFiles[destinationFile].push(sviFileToLoad.filePath);
      } else {
        destinationFiles[destinationFile] = [sviFileToLoad.filePath];
      }
    });

    // 2️⃣ Detect any destination that appears more than once
    Object.keys(destinationFiles).forEach((destinationFile) => {
      const sources = destinationFiles[destinationFile];
      if (sources.length > 1) {
        const errorMessage = this.createErrorMessage(destinationFile, sources);
        errors.push(errorMessage);
      }
    });

    // 3️⃣ Return the aggregated result
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Formats the error string according to the specification.
   * @param destinationFile The colliding destination path.
   * @param sviFiles Array of source .svi file paths that map to the destination.
   * @returns Formatted error message.
   */
  private createErrorMessage(destinationFile: string, sviFiles: string[]): string {
    return (
      `Error: Multiple SVI files are configured to generate the same destination file: '${destinationFile}':\n` +
      sviFiles.map((file) => `- ${file}`).join("\n")
    );
  }
}