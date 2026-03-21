import path from "path";
import { Config } from "../config/config";
import { getRelativePath } from "../utils/file";
import { SVIFile, SVIOptionValue, ImportPromptPath } from "./types";

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
      throw new Error("SVIFile filePath is not defined, cannot get file name.");
    }
    return path.basename(this.filePath);
  }

  getSviFileDirectory(): string {
    if (!this.filePath) {
      throw new Error("SVIFile filePath is not defined, cannot get file directory.");
    }
    return path.dirname(path.resolve(this.filePath));
  }

  getSviFileRelativePath(): string {
    if (!this.filePath) {
      throw new Error("SVIFile filePath is not defined, cannot get relative path.");
    }
    const config = Config.getInstance();
    return getRelativePath(path.resolve(this.filePath), config.dir);
  }

  getSviFileFullPath(): string {
    if (!this.filePath) {
      throw new Error("SVIFile filePath is not defined, cannot get full path.");
    }
    return path.resolve(this.filePath);
  }

  getDestinationFileFullPath(): string | undefined {
    if (!this.destinationFile) {
      return undefined;
    }
    if (!this.filePath) {
      // If SVI file path is not defined, we cannot resolve the destination file relative to it.
      // The interface allows `undefined`, so returning `undefined` is appropriate here.
      return undefined;
    }
    return path.resolve(this.getSviFileDirectory(), this.destinationFile);
  }

  getDestinationFileRelativePath(): string | undefined {
    const fullPath = this.getDestinationFileFullPath();
    if (!fullPath) {
      return undefined;
    }
    const config = Config.getInstance();
    return getRelativePath(fullPath, config.dir);
  }

  getImportPromptsFullPaths(): ImportPromptPath[] {
    if (!this.importPrompts || this.importPrompts.length === 0) {
      return [];
    }
    if (!this.filePath) {
      // Cannot resolve full paths without the base SVI file path.
      // Returning an empty array to comply with the interface type.
      return [];
    }

    const sviFileDir = this.getSviFileDirectory();
    const config = Config.getInstance();

    return this.importPrompts.map(relativePath => {
      const fullPath = path.resolve(sviFileDir, relativePath);
      const configRelativePath = getRelativePath(fullPath, config.dir);
      return {
        relativePath: configRelativePath,
        fullPath: fullPath,
      };
    });
  }

  getDependenciesFullPaths(): ImportPromptPath[] {
    if (!this.dependencies || this.dependencies.length === 0) {
      return [];
    }
    if (!this.filePath) {
      // Cannot resolve full paths without the base SVI file path.
      // Returning an empty array to comply with the interface type.
      return [];
    }

    const sviFileDir = this.getSviFileDirectory();
    const config = Config.getInstance();

    return this.dependencies.map(relativePath => {
      const fullPath = path.resolve(sviFileDir, relativePath);
      const configRelativePath = getRelativePath(fullPath, config.dir);
      return {
        relativePath: configRelativePath,
        fullPath: fullPath,
      };
    });
  }
}