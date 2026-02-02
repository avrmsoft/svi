import path from "path";
import { Config } from "../config/config";
import { getRelativePath } from "../utils/file";
import { SVIFile, SVIOptionValue, ImportPromptPath } from "./types"; // Assuming types.ts is in the same directory

export default class SviFileClass implements SVIFile {
  filePath?: string;
  destinationFile?: string;
  dependencies?: string[];
  output?: string[];
  options?: Record<string, SVIOptionValue>;
  importPrompts?: string[];
  prompt?: string;

  constructor(data?: Partial<SVIFile>) {
    this.filePath = data?.filePath;
    this.destinationFile = data?.destinationFile;
    this.dependencies = data?.dependencies;
    this.output = data?.output;
    this.options = data?.options;
    this.importPrompts = data?.importPrompts;
    this.prompt = data?.prompt;
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

  getSviFileRelativePath(): string {
    if (!this.filePath) {
      return "";
    }
    const config = Config.getInstance();
    return getRelativePath(this.filePath, config.dir);
  }

  getDestinationFileFullPath(): string | undefined {
    if (!this.filePath || !this.destinationFile) {
      return undefined;
    }
    const sviFileDir = this.getSviFileDirectory();
    return path.resolve(sviFileDir, this.destinationFile);
  }

  getImportPromptsFullPaths(): ImportPromptPath[] {
    if (!this.filePath || !this.importPrompts || this.importPrompts.length === 0) {
      return [];
    }

    const sviFileDir = this.getSviFileDirectory();
    return this.importPrompts.map(relativePath => {
      const fullPath = path.resolve(sviFileDir, relativePath);
      return {
        relativePath: relativePath,
        fullPath: fullPath,
      };
    });
  }
}