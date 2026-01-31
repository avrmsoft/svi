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
