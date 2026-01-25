import * as path from 'path';
import { SVIFile, SVIOptionValue } from "./types";

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
    return this.filePath ? path.basename(this.filePath) : '';
  }

  getSviFileDirectory(): string {
    return this.filePath ? path.dirname(this.filePath) : '';
  }

  getDestinationFileFullPath(): string | undefined {
    if (!this.filePath || !this.destinationFile) {
      return undefined;
    }
    const sviFileDir = this.getSviFileDirectory();
    return path.resolve(sviFileDir, this.destinationFile);
  }

  getImportPromptsFullPaths(): string[] {
    if (!this.filePath || !this.importPrompts || this.importPrompts.length === 0) {
      return [];
    }
    const sviFileDir = this.getSviFileDirectory();
    return this.importPrompts.map(importPath =>
      path.resolve(sviFileDir, importPath)
    );
  }
}