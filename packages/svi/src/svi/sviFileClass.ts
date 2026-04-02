// src\svi\sviFileClass.ts
import path from "path";
import { Config } from "../config/config";
import { getRelativePath } from "../utils/file2";
import { resolvePath } from "../utils/pathResolver";
import { SVIFile, SVIOptionValue, ImportPromptPath } from "./types";

export default class SviFileClass implements SVIFile {
  public filePath?: string;
  public destinationFile?: string;
  public dependencies?: string[];
  public output?: string[];
  public options?: Record<string, SVIOptionValue>;
  public importPrompts?: string[];
  public prompt?: string;

  constructor(data?: SVIFile) {
    if (data) {
      this.filePath = data.filePath;
      this.destinationFile = data.destinationFile;
      this.dependencies = data.dependencies;
      this.output = data.output;
      this.options = data.options;
      this.importPrompts = data.importPrompts;
      this.prompt = data.prompt;
    }
    // If data is not provided, properties remain undefined by default
  }

  /**
   * Helper to safely get the SVI file's directory.
   * Returns undefined if filePath is not set.
   */
  private getSviFileDirectorySafe(): string | undefined {
    return this.filePath ? path.dirname(this.filePath) : undefined;
  }

  /**
   * Returns the base name of the SVI file.
   * Throws an error if filePath is not set, as a string return is mandatory.
   */
  getSviFileName(): string {
    if (this.filePath === undefined) {
      throw new Error("filePath is undefined. Cannot get SVI file name.");
    }
    return path.basename(this.filePath);
  }

  /**
   * Returns the directory of the SVI file.
   * Throws an error if filePath is not set, as a string return is mandatory.
   */
  getSviFileDirectory(): string {
    if (this.filePath === undefined) {
      throw new Error("filePath is undefined. Cannot get SVI file directory.");
    }
    return path.dirname(this.filePath);
  }

  /**
   * Returns the relative path of the SVI file to the project's config directory.
   * Throws an error if filePath is not set, as a string return is mandatory.
   */
  getSviFileRelativePath(): string {
    if (this.filePath === undefined) {
      throw new Error("filePath is undefined. Cannot get SVI file relative path.");
    }
    const config = Config.getInstance();
    return getRelativePath(this.filePath, config.dir);
  }

  /**
   * Returns the full path of the SVI file.
   * Throws an error if filePath is not set, as a string return is mandatory.
   */
  getSviFileFullPath(): string {
    if (this.filePath === undefined) {
      throw new Error("filePath is undefined. Cannot get SVI file full path.");
    }
    return this.filePath;
  }

  /**
   * Returns the full path of the destination file.
   * Returns undefined if destinationFile or filePath is not set.
   */
  getDestinationFileFullPath(): string | undefined {
    if (this.destinationFile === undefined) {
      return undefined;
    }
    const sviFileDir = this.getSviFileDirectorySafe();
    if (sviFileDir === undefined) {
      // Cannot resolve a relative destination file without the SVI file's own path.
      return undefined;
    }
    return resolvePath(this.destinationFile, sviFileDir);
  }

  /**
   * Returns the relative path of the destination file to the project's config directory.
   * Returns undefined if the full path cannot be determined.
   */
  getDestinationFileRelativePath(): string | undefined {
    const fullPath = this.getDestinationFileFullPath();
    if (fullPath === undefined) {
      return undefined;
    }
    const config = Config.getInstance();
    return getRelativePath(fullPath, config.dir);
  }

  /**
   * Returns an array of full paths for all imported prompts.
   * Returns an empty array if no importPrompts are defined or if filePath is not set.
   */
  getImportPromptsFullPaths(): ImportPromptPath[] {
    if (!this.importPrompts || this.importPrompts.length === 0) {
      return [];
    }
    const sviFileDir = this.getSviFileDirectorySafe();
    if (sviFileDir === undefined) {
      // Cannot resolve relative import prompt paths without the SVI file's own path.
      return [];
    }
    return this.importPrompts.map(relativePath => ({
      relativePath: relativePath,
      fullPath: resolvePath(relativePath, sviFileDir),
    }));
  }

  /**
   * Returns an array of full paths for all dependencies.
   * Returns an empty array if no dependencies are defined or if filePath is not set.
   */
  getDependenciesFullPaths(): ImportPromptPath[] {
    if (!this.dependencies || this.dependencies.length === 0) {
      return [];
    }
    const sviFileDir = this.getSviFileDirectorySafe();
    if (sviFileDir === undefined) {
      // Cannot resolve relative dependency paths without the SVI file's own path.
      return [];
    }
    return this.dependencies.map(relativePath => ({
      relativePath: relativePath,
      fullPath: resolvePath(relativePath, sviFileDir),
    }));
  }
}