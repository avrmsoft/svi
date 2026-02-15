import { SVIParser } from "./sviParser";
import { SVIFile } from "./types";
import fs from "fs";
import path from "path";

/**
 * Performs correctness checks on all SVI files in the project.
 */
export default class SviChecker {
  private sviParser: SVIParser;
  private errors: string[] = [];

  constructor(sviParser: SVIParser) {
    this.sviParser = sviParser;
  }

  /**
   * Runs a suite of checks on the provided SVI file paths.
   * @param sviFilePaths A list of full paths to SVI files.
   * @returns `true` if all checks pass without errors, `false` otherwise.
   */
  public check(sviFilePaths: string[]): boolean {
    this.errors = []; // Clear previous errors

    // Stores successfully parsed SVI files along with their original full paths.
    // This allows us to perform multiple checks efficiently without re-parsing.
    const successfullyParsedFiles: { sviFile: SVIFile; originalPath: string }[] = [];

    // For Check 1: Maps a resolved destination file full path to a list of original SVI file paths
    // that are configured to generate it.
    const destinationToFilePaths = new Map<string, string[]>();

    // ----------------------------------------------------------------------
    // Step 1: Parse all SVI files and collect valid ones,
    //         also prepare data structures for subsequent checks.
    // ----------------------------------------------------------------------
    for (const sviFilePath of sviFilePaths) {
      let parsedSvi: SVIFile | null = null;
      try {
        parsedSvi = this.sviParser.parseFile(sviFilePath);
      } catch (e: any) {
        this.errors.push(`Error parsing SVI file ${sviFilePath}: ${e.message}`);
        // If the parser itself threw an error (e.g., file not found),
        // any internal parse messages might not be relevant, but calling it
        // ensures any accumulated warnings/errors are surfaced.
        this.sviParser.logParseMessages();
        continue;
      }

      if (!parsedSvi) {
        // If parseFile returns null, it indicates that the file could not be parsed due to
        // internal format errors (e.g., duplicate sections, missing prompt).
        // The SVIParser would have logged specific details itself.
        this.errors.push(`Error: SVI file ${sviFilePath} could not be parsed successfully. Please check the file's format and parser logs for details.`);
        this.sviParser.logParseMessages(); // Ensure parser's internal errors/warnings are also logged
        continue;
      }

      // The SVIFile interface has `filePath` as optional, but the SVIParser is expected
      // to set it upon successful parsing.
      if (!parsedSvi.filePath) {
          this.errors.push(`Internal error: Parsed SVIFile object for ${sviFilePath} is missing its 'filePath' property.`);
          continue;
      }

      successfullyParsedFiles.push({ sviFile: parsedSvi, originalPath: sviFilePath });

      // Populate data for Check 1: Collect all destination file paths.
      const destinationFileFullPath = parsedSvi.getDestinationFileFullPath();
      if (destinationFileFullPath) {
        const paths = destinationToFilePaths.get(destinationFileFullPath) || [];
        paths.push(sviFilePath);
        destinationToFilePaths.set(destinationFileFullPath, paths);
      }
    }

    // ----------------------------------------------------------------------
    // Step 2: Perform Check 1 - Duplicate Destination Files
    //         If several *.svi files have the same destination file.
    // ----------------------------------------------------------------------
    for (const [destinationPath, sviSourcePaths] of destinationToFilePaths.entries()) {
      if (sviSourcePaths.length > 1) {
        const errorMsg = `Error: Multiple SVI files are configured to generate the same destination file: '${destinationPath}':\n${sviSourcePaths.map(p => `- ${p}`).join('\n')}`;
        this.errors.push(errorMsg);
      }
    }

    // ----------------------------------------------------------------------
    // Step 3: Perform Check 2 - Destination File Points to Itself
    //         If *.svi file in the # Destination points to itself.
    // ----------------------------------------------------------------------
    for (const { sviFile, originalPath } of successfullyParsedFiles) {
      const destinationRelativePath = sviFile.getDestinationFileRelativePath();
      const sviFileRelativePath = sviFile.getSviFileRelativePath();

      // Check if both paths are defined and if they are identical.
      if (destinationRelativePath && sviFileRelativePath && destinationRelativePath === sviFileRelativePath) {
        this.errors.push(`Error in file ${originalPath}: The destination file cannot be the same as the source file. Please change the destination file and try again.`);
      }
    }

    // Return true if no errors were collected, false otherwise.
    return this.errors.length === 0;
  }

  /**
   * Logs all collected errors to the console.
   */
  public logErrors(): void {
    if (this.errors.length > 0) {
      console.error('------- SVI Checker Errors -------');
      for (const error of this.errors) {
        console.error(error);
      }
      console.error('----------------------------------');
    }
  }
}