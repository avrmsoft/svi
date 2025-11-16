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

  public loadImportedPrompts(): void {
    if (
      !this.sviFile.importPrompts ||
      this.sviFile.importPrompts.length === 0
    ) {
      return;
    }

    for (const promptPath of this.sviFile.importPrompts) {
      const resolvedPath = this.resolvePromptPath(promptPath);
      const dependencySVI = this.loadSVIFile(resolvedPath);
      if (dependencySVI && dependencySVI.prompt) {
        const promptContent = dependencySVI.prompt;
        const promptHash = this.computeHash(promptContent);
        this.importedPrompts.push({
          prompt: promptContent,
          hash: promptHash,
        });
      } else {
        Logger.error(
          `Failed to load imported prompt from dependency ${resolvedPath}`
        );
      }
    }
  }

  private resolvePromptPath(promptPath: string): string {
    if (this.sviFile.filePath) {
      const sviDir = path.dirname(this.sviFile.filePath);
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
}
