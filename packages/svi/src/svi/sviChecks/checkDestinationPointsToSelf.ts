import ParsedSviDirectory from "../sviParser/parsedSviDirectory";
import { SVIFile, SviFileToLoad } from "../types";
import { checkResults, OneSviCheck } from "./types";
import path from "path";

export default class SviCheckDestinationPointsToSelf implements OneSviCheck {
  check(sviFilePaths: SviFileToLoad[]): checkResults {
    const errors: string[] = [];

    sviFilePaths.forEach((sviFilePath) => {
      const sviFile = ParsedSviDirectory.getInstance().getParsedSviFile(sviFilePath.filePath);
      if (!sviFile) return;

      const sviRelative = sviFile.getSviFileRelativePath();
      const destRelative = sviFile.getDestinationFileRelativePath();

      if (destRelative && path.normalize(sviRelative) === path.normalize(destRelative)) {
        errors.push(
          `Error in file ${sviFilePath.filePath}: The destination file cannot be the same as the source file. Please change the destination file and try again.`
        );
      }
    });

    return { isValid: errors.length === 0, errors };
  }
}