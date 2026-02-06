import path from "path";
import { SVIFile, ImportPromptPath, SVIOptionValue } from "./types";
import { Config } from "../config/config";
import { getRelativePath } from "../utils/file";

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
    // If 'data' is not provided, or specific properties are missing from 'data',
    // the corresponding class attributes will remain undefined as declared.
  }

  private _ensureFilePath(): string {
    if (this.filePath === undefined) {
      throw new Error("SVIFile filePath is not set. Cannot perform path operations.");
    }
    return this.filePath;
  }

  getSviFileName(): string {
    const filePath = this._ensureFilePath();
    return path.basename(filePath);
  }

  getSviFileDirectory(): string {
    const filePath = this._ensureFilePath();
    return path.dirname(filePath);
  }

  getSviFileRelativePath(): string {
    const filePath = this._ensureFilePath();
    const config = Config.getInstance();
    // Assuming config.dir is a valid string for the base path
    return getRelativePath(filePath, config.dir);
  }

  getDestinationFileFullPath(): string | undefined {
    if (!this.destinationFile) {
      return undefined;
    }
    const sviFileDirectory = this.getSviFileDirectory(); // This method will throw if filePath is not set.
    return path.resolve(sviFileDirectory, this.destinationFile);
  }

  getDestinationFileRelativePath(): string | undefined {
    const destinationFileFullPath = this.getDestinationFileFullPath();
    if (!destinationFileFullPath) {
      return undefined;
    }
    const config = Config.getInstance();
    // Assuming config.dir is a valid string for the base path
    return getRelativePath(destinationFileFullPath, config.dir);
  }

  getImportPromptsFullPaths(): ImportPromptPath[] {
    if (!this.importPrompts || this.importPrompts.length === 0) {
      return [];
    }

    const sviFileDirectory = this.getSviFileDirectory(); // This method will throw if filePath is not set.

    return this.importPrompts.map((relativePath) => ({
      relativePath,
      fullPath: path.resolve(sviFileDirectory, relativePath),
    }));
  }
}