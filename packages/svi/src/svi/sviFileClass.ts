import path from 'path';

export type SVIOptionValue = string | boolean;

export interface ImportPromptPath {
  relativePath: string;
  fullPath: string;
}

export interface SVIFile {
  filePath?: string;
  destinationFile?: string;
  dependencies?: string[];
  output?: string[];
  options?: Record<string, SVIOptionValue>;
  importPrompts?: string[];
  prompt?: string;

  getSviFileName(): string;
  getSviFileDirectory(): string;
  getDestinationFileFullPath(): string | undefined;
  getImportPromptsFullPaths(): ImportPromptPath[];
}

export default class SviFileClass implements SVIFile {
  filePath?: string;
  destinationFile?: string;
  dependencies?: string[];
  output?: string[];
  options?: Record<string, SVIOptionValue>;
  importPrompts?: string[];
  prompt?: string;

  constructor(data?: Partial<SVIFile>) {
    if (data) {
      this.filePath = data.filePath;
      this.destinationFile = data.destinationFile;
      this.dependencies = data.dependencies;
      this.output = data.output;
      this.options = data.options;
      this.importPrompts = data.importPrompts;
      this.prompt = data.prompt;
    }
  }

  getSviFileName(): string {
    if (this.filePath) {
      return path.basename(this.filePath);
    }
    return '';
  }

  getSviFileDirectory(): string {
    if (this.filePath) {
      return path.dirname(this.filePath);
    }
    return '';
  }

  getDestinationFileFullPath(): string | undefined {
    if (this.filePath && this.destinationFile) {
      const sviFileDirectory = this.getSviFileDirectory();
      return path.resolve(sviFileDirectory, this.destinationFile);
    }
    return undefined;
  }

  getImportPromptsFullPaths(): ImportPromptPath[] {
    if (!this.filePath || !this.importPrompts || this.importPrompts.length === 0) {
      return [];
    }

    const sviFileDirectory = this.getSviFileDirectory();
    return this.importPrompts.map(relativePath => ({
      relativePath: relativePath,
      fullPath: path.resolve(sviFileDirectory, relativePath),
    }));
  }
}