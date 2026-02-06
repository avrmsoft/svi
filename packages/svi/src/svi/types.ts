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
  getSviFileRelativePath(): string;
  getDestinationFileFullPath(): string | undefined;
  getDestinationFileRelativePath(): string | undefined;
  getImportPromptsFullPaths(): ImportPromptPath[];
}
