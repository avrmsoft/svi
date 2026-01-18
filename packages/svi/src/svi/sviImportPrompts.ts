import { SVIFile } from "./types";
import Logger from "../utils/logger";
import path from "path";
import { SVIParser } from "./sviParser";
import { computeHashFromString } from "../utils/utils";

interface ImportedPrompt {
  prompt: string;
  hash: string;
}

export class SVIImportPrompts {
  private sviFile: SVIFile;
  private importedPrompts: ImportedPrompt[] = [];

  constructor(sviFile: SVIFile) {
    this.sviFile = sviFile;
  }

  public getImportedPrompts(): ImportedPrompt[] {
    return this.importedPrompts;
  }

  public getImportedPromptsAsString(): string {
    return this.importedPrompts.map((imp) => imp.prompt).join("\n---\n");
  }

  public loadImportedPrompts(): boolean {
    return this.loadImportedPromptsFromSvi(this.sviFile);
  }

  private loadImportedPromptsFromSvi(sviFile: SVIFile): boolean {
    if (!sviFile.importPrompts || sviFile.importPrompts.length === 0) {
      return true;
    }

    let bResult: boolean = true;

    for (const promptPath of sviFile.importPrompts) {
      const resolvedPath = this.resolvePromptPath(promptPath, sviFile);
      if (!this.loadPromptForPath(resolvedPath)) {
        bResult = false;
      }
    }

    return bResult;
  }

  private resolvePromptPath(
    promptPath: string,
    relativeToSvi?: SVIFile,
  ): string {
    const relativeToSviFile = relativeToSvi || this.sviFile;
    if (relativeToSviFile.filePath) {
      const sviDir = path.dirname(relativeToSviFile.filePath);
      return path.resolve(sviDir, promptPath);
    }
    return promptPath;
  }

  private loadSVIFile(filePath: string): SVIFile | null {
    try {
      const parser = new SVIParser();
      return parser.parseFile(filePath);
    } catch (error) {
      Logger.error(`Error loading SVI file ${filePath}: ${error}`);
      return null;
    }
  }

  private computeHash(content: string): string {
    return computeHashFromString(content);
  }

  private loadPromptForPath(path: string): boolean {
    const dependencySVI = this.loadSVIFile(path);
    if (dependencySVI && dependencySVI.prompt) {
      const promptContent = dependencySVI.prompt;
      const promptHash = this.computeHash(promptContent);
      if (this.hashExists(promptHash)) {
        return true;
      }

      this.importedPrompts.push({
        prompt: promptContent,
        hash: promptHash,
      });

      return this.loadImportedPromptsFromSvi(dependencySVI);
    } else {
      Logger.error(`Failed to load imported prompt from dependency ${path}`);

      return false;
    }
  }

  private hashExists(hash: string): boolean {
    return this.importedPrompts.some((imp) => imp.hash === hash);
  }
}
