export type SVIOptionValue = string | boolean;

export interface SVIFile {
  filePath?: string;
  destinationFile?: string;
  inputParameters?: string[];
  output?: string[];
  options?: Record<string, SVIOptionValue>;
  importPrompts?: string[];
  prompt?: string;
}
