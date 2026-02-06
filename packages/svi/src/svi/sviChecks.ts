import { SVIParser } from "./sviParser";
import { SVIFile } from "./types";

export default class SviChecker {
  private sviParser: SVIParser;
  private errors: string[] = [];

  constructor(sviParser: SVIParser) {
    this.sviParser = sviParser;
  }

  public check(sviFilePaths: string[]): boolean {
    this.errors = []; // Clear previous errors
    const destinationToFilePaths = new Map<string, string[]>();

    for (const filePath of sviFilePaths) {
      try {
        const sviFile: SVIFile | null = this.sviParser.parseFile(filePath);

        // Log parser errors/warnings if any
        this.sviParser.logParseMessages();

        if (sviFile) {
          const destinationFileFullPath = sviFile.getDestinationFileFullPath();

          if (destinationFileFullPath) {
            if (!destinationToFilePaths.has(destinationFileFullPath)) {
              destinationToFilePaths.set(destinationFileFullPath, []);
            }
            destinationToFilePaths.get(destinationFileFullPath)!.push(filePath);
          }
        }
      } catch (e: any) {
        this.errors.push(`Error parsing SVI file '${filePath}': ${e.message}`);
      }
    }

    // Check for duplicate destination files
    for (const [destinationPath, sourcePaths] of destinationToFilePaths.entries()) {
      if (sourcePaths.length > 1) {
        let errorMessage = `Error: Multiple SVI files are configured to generate the same destination file: '${destinationPath}':\n`;
        sourcePaths.forEach((sourcePath) => {
          errorMessage += `- ${sourcePath}\n`;
        });
        this.errors.push(errorMessage.trim());
      }
    }

    return this.errors.length === 0;
  }

  public logErrors(): void {
    if (this.errors.length > 0) {
      console.error("----- SVI Checker Errors -----");
      this.errors.forEach((error) => console.error(error));
      console.error("------------------------------");
    }
  }
}