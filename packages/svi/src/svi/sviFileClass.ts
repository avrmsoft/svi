import * as path from "node:path";
import { SVIFile, ImportPromptPath, SVIOptionValue } from "./types";

export default class SviFileClass implements SVIFile {
  filePath?: string;
  destinationFile?: string;
  inputParameters?: string[];
  output?: string[];
  options?: Record<string, SVIOptionValue>;
  importPrompts?: string[];
  prompt?: string;

  constructor(data?: SVIFile) {
    if (data) {
      this.filePath = data.filePath;
      this.destinationFile = data.destinationFile;
      this.inputParameters = data.inputParameters;
      this.output = data.output;
      this.options = data.options;
      this.importPrompts = data.importPrompts;
      this.prompt = data.prompt;
    }
  }

  getSviFileName(): string {
    if (!this.filePath) {
      return "";
    }
    return path.basename(this.filePath);
  }

  getSviFileDirectory(): string {
    if (!this.filePath) {
      return "";
    }
    return path.dirname(this.filePath);
  }

  getDestinationFileFullPath(): string | undefined {
    if (!this.filePath || !this.destinationFile) {
      return undefined;
    }
    const sviDirectory = this.getSviFileDirectory();
    return path.resolve(sviDirectory, this.destinationFile);
  }

  getImportPromptsFullPaths(): ImportPromptPath[] {
    if (!this.filePath || !this.importPrompts || this.importPrompts.length === 0) {
      return [];
    }

    const sviDirectory = this.getSviFileDirectory();
    return this.importPrompts.map((relativePath) => ({
      relativePath: relativePath,
      fullPath: path.resolve(sviDirectory, relativePath),
    }));
  }
}