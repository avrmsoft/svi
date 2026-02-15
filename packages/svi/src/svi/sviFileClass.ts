// src\svi\sviFileClass.ts
import path from "path";
// If fs is needed later for file operations, import it like this:
// import fs from "fs";

import { Config } from "../config/config";
import { getRelativePath } from "../utils/file";
import { ImportPromptPath, SVIFile, SVIOptionValue } from "./types";

interface SVIFileConstructorData {
  filePath?: string;
  destinationFile?: string;
  dependencies?: string[];
  output?: string[];
  options?: Record<string, SVIOptionValue>;
  importPrompts?: string[];
  prompt?: string;
}

export default class SviFileClass implements SVIFile {
  filePath?: string;
  destinationFile?: string;
  dependencies?: string[];
  output?: string[];
  options?: Record<string, SVIOptionValue>;
  importPrompts?: string[];
  prompt?: string;

  constructor(data?: SVIFileConstructorData) {
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

  getSviFileFullPath(): string {
    if (!this.filePath) {
      return "";
    }
    const config = Config.getInstance();
    // Resolve this.filePath against the project's base directory (config.dir).
    // If this.filePath is already absolute, path.resolve will return it directly.
    return path.resolve(config.dir, this.filePath);
  }

  getSviFileRelativePath(): string {
    if (!this.filePath) {
      return "";
    }
    const config = Config.getInstance();
    // getRelativePath expects the full path of the file and the base directory.
    // We use getSviFileFullPath() to ensure we have the absolute path of the SVI file.
    return getRelativePath(this.getSviFileFullPath(), config.dir);
  }

  getDestinationFileFullPath(): string | undefined {
    if (!this.destinationFile) {
      return undefined;
    }
    const config = Config.getInstance();
    // The destination file path is often relative to the SVI file's directory.
    // Get the absolute directory of the current SVI file.
    const currentSviFileAbsoluteDir = path.dirname(this.getSviFileFullPath());
    // Resolve the destinationFile against the SVI file's absolute directory.
    // If destinationFile is absolute, path.resolve will return it directly.
    return path.resolve(currentSviFileAbsoluteDir, this.destinationFile);
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

    const config = Config.getInstance();
    // Get the absolute directory of the current SVI file.
    const currentSviFileAbsoluteDir = path.dirname(this.getSviFileFullPath());

    return this.importPrompts.map((relativePathInPrompt) => {
      // Each path in importPrompts is typically relative to the current SVI file's directory.
      const fullPath = path.resolve(currentSviFileAbsoluteDir, relativePathInPrompt);
      // Calculate the path relative to the project's base directory (config.dir).
      const relativeToConfigPath = getRelativePath(fullPath, config.dir);
      return {
        relativePath: relativeToConfigPath,
        fullPath: fullPath,
      };
    });
  }
}