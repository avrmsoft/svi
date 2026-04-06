import ParsedSviDirectory from "../sviParser/parsedSviDirectory";
import { SVIFile, SviFileToLoad } from "../types";
import { checkResults, OneSviCheck } from "./types";

export default class SviCheckMultipleLinesInDestination implements OneSviCheck {
  check(sviFilePaths: SviFileToLoad[]): checkResults {
    const errors: string[] = [];
    const parsedSviDirectory = ParsedSviDirectory.getInstance();

    for (const sviFileToLoad of sviFilePaths) {
      const sviFile = parsedSviDirectory.getParsedSviFile(sviFileToLoad.filePath);

      // If sviFile is null, it means the parsing failed or the file was not found.
      // Other checks might handle such cases, for this specific check, we cannot proceed
      // without a parsed SVIFile.
      if (!sviFile) {
        continue;
      }

      const destinationContent = sviFile.destinationFile;

      if (destinationContent !== undefined) {
        const lines = destinationContent.split('\n');
        const nonBlankLines = lines.filter(line => line.trim().length > 0);

        if (nonBlankLines.length > 1) {
          errors.push(
            `Error in file ${sviFileToLoad.filePath}: More than one item in the # Destination section`
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }
}